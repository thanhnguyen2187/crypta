import { drizzle } from 'drizzle-orm/sqlite-proxy'
import type { Invalidator, Readable, Subscriber, Unsubscriber, Writable } from 'svelte/store'
import { derived, get, writable } from 'svelte/store'
import type { MigrationState } from '$lib/sqlite/migration'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import type { GlobalState, Snippet, SnippetStore } from '$lib/utitlities/persistence'
import { createLocalSnippetStoreV2 } from '$lib/utitlities/persistence'
import { querySnippetsByFolderId, upsertSnippet } from '$lib/sqlite/queries'
import { dbSnippetToDisplaySnippet, displaySnippetToDbSnippet } from '$lib/utitlities/data-transformation'

export type Params = {[key: string]: any}

export type Transaction =
  { noFail?: boolean } &
  (
    { query: string } |
    { statement: string }
  ) &
  (
    { values?: Params | any[] } |
    { valuesBatch?: Params[] }
  )

export type Request = {
  credentials?: {
    user: string
    password: string
  }
  transaction: Transaction[]
}

export type ResultTrue =
  { success: true } &
  (
    { resultSet: any[] } |
    { rowsUpdated: number } |
    { rowsUpdatedBatch: number[] }
  )

export type ResultFalse = {
  success: false
  error: string
}

export type ResponseExecuteError = {
  reqIdx: number
  message: string
}

export type Result = ResultTrue | ResultFalse

export type Response =
  {
    results: Result[]
  } |
  ResponseExecuteError

export type SqlitergExecutor = {
  isReachable(): Promise<boolean>
  isAuthenticated(): Promise<boolean>
  execute(queryOrStatement: string, params: Params | any[]): Promise<Response>
}

export function createSqlitergExecutor(
  url: string,
  username: string,
  password: string,
): SqlitergExecutor {
  const authBase64 = Buffer.from(`${username}:${password}`).toString('base64')
  async function send(request: Request): Promise<Response> {
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          // We need this to make testing works, as `fetch` of Vite would use
          // `Accept-Encoding: br, gzip, deflate`. It conflicts with the HTTP
          // server used by `sqliterg`, and make the underlying function unable
          // to decode the response.
          'Accept-Encoding': '*',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authBase64}`,
        },
        body: JSON.stringify(request)
      },
    )
    return response.json()
  }
  return {
    async isReachable(): Promise<boolean> {
      try {
        const response = await fetch(
          url,
          {
            method: 'HEAD',
            mode: 'no-cors',
          }
        )
        return true
      } catch (e) {
        return false
      }
    },
    async isAuthenticated(): Promise<boolean> {
      try {
        const response = await send({
          transaction: [
            {
              query: 'SELECT 1'
            }
          ],
        })
        if ('results' in response) {
          return response.results[0].success
        }
        if ('reqIdx' in response) {
          console.warn('createSqlitergExecutor.isAuthenticated', response)
          return false
        }
      } catch (e) {
        return false
      }
      throw Error('isAuthenticated: unreachable code')
    },
    async execute(queryOrStatement: string, params: Params | any[]): Promise<Response> {
      const queryOrStatementLowered = queryOrStatement.toLowerCase()
      let request: Request = {
        transaction: [],
      }

      if (
        queryOrStatementLowered.startsWith('select') ||
        queryOrStatementLowered.startsWith('pragma')
      ) {
        const transaction: Transaction = {
          query: queryOrStatement,
          values: params,
        }
        request.transaction.push(transaction)
      } else {
        const transaction: Transaction = {
          statement: queryOrStatement,
          values: params,
        }
        request.transaction.push(transaction)
      }

      return await send(request)
    }
  }
}

export function createRemoteDb(executor: SqlitergExecutor) {
  return drizzle(async (queryString, params, method) => {
    const response = await executor.execute(queryString, params)
    if ('reqIdx' in response) {
      console.warn('createRemoteDb.drizzle execution ', response)
      return {rows: []}
    }
    if (response.results.length === 0 || !response.results[0].success) {
      return {rows: []}
    }
    const result = response.results[0]
    // @ts-ignore
    const records = result['resultSet'] as any[]
    if (records) {
      const values = records.map(Object.values)
      if (method === 'get' && values.length > 0) {
        return {rows: values[0]}
      }
      return {rows: values}
    }
    return {rows: []}
  })
}

export type RemoteSnippetStore =
  SnippetStore &
  {
    isAvailable(): Promise<boolean>
  }

export type RemoteAvailabilityStore =
  Readable<boolean> &
  {
    isAvailable(): Promise<boolean>
  }

export async function createRemoteSnippetStore(
  migrationStateStore: Writable<MigrationState>,
  globalStateStore: Writable<GlobalState>,
  executorStore: Readable<SqlitergExecutor>,
): Promise<RemoteSnippetStore> {
  let remoteDb: SqliteRemoteDatabase
  let executor: SqlitergExecutor
  let snippets: Snippet[] = []
  let folderId = ''
  // Ideally, we can use an underlying store instead of duplicating the logic
  // like this, but testing yields some really strange type error with `fetch`.
  // Therefore, I resolved to this duplicated logic.
  //
  // Can look at this commit for more detail:
  // https://github.com/thanhnguyen2187/crypta/pull/38/commits/157990972cef749af703e0c799026661a436eb5d
  const snippetsStore = writable<Snippet[]>(snippets)
  const executorUnsubscribeFn = executorStore.subscribe(
    async (executor_) => {
      executor = executor_

      const available = await isAvailable()
      if (!available) {
        return
      }

      remoteDb = createRemoteDb(executor)
      const dbSnippets = await querySnippetsByFolderId(remoteDb, get(globalStateStore).folderId)
      snippets = dbSnippets.map(
        (dbSnippet) => dbSnippetToDisplaySnippet(dbSnippet, {})
      )
      snippetsStore.set(snippets)
    }
  )

  async function isAvailable(): Promise<boolean> {
    const reachable = await executor.isReachable()
    if (!reachable) {
      return false
    }
    const authenticated = await executor.isAuthenticated()
    if (!authenticated) {
      return false
    }
    const migrationDone = get(migrationStateStore) === 'done'
    // noinspection RedundantIfStatementJS
    if (!migrationDone) {
      return false
    }

    return true
  }

  return {
    subscribe(
      run: Subscriber<Snippet[]>,
      invalidate?: Invalidator<Snippet[]>,
    ): Unsubscriber {
      const baseUnsubscribeFn = snippetsStore.subscribe(run, invalidate)

      return () => {
        baseUnsubscribeFn()
        executorUnsubscribeFn()
      }
    },
    async clone(snippet: Snippet) {
      if (!await isAvailable()) {
        return
      }
    },
    async upsert(snippet: Snippet) {
      if (!await isAvailable()) {
        return
      }

      snippets.push(snippet)
      snippetsStore.set(snippets)
      const dbSnippet = displaySnippetToDbSnippet('default', snippet)
      await upsertSnippet(remoteDb, dbSnippet)
    },
    async remove(id: string) {
      if (!await isAvailable()) {
        return
      }
    },
    async move(
      movingSnippet: Snippet,
      sourceFolderId: string,
      destinationFolderId: string,
    ) {
      if (!await isAvailable()) {
        return
      }
    },
    isAvailable,
  }
}

