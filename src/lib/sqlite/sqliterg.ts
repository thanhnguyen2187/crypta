import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import type { Invalidator, Readable, Subscriber, Unsubscriber, Writable } from 'svelte/store'
import { get, writable } from 'svelte/store'
import type { MigrationState, MigrationQueryMap, QueriesStringMap } from './migration'
import {
  defaultMigrationQueryMap,
  defaultQueriesStringMap,
  migrate,
} from './migration'
import type { GlobalState, Snippet, SnippetStore } from '$lib/utitlities/persistence'
import {
  clearTags,
  deleteAllSnippets,
  deleteSnippet as deleteSnippet_,
  deleteSnippetsByFolder,
  querySnippetsByFolderId,
  upsertSnippet,
  upsertTags,
} from './queries'
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
  executeBatchStatements(statements: string[]): Promise<Response>
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
    },
    async executeBatchStatements(statements: string[]): Promise<Response> {
      const request: Request = {
        transaction: statements.map((statement) => {
          return {
            statement: statement,
          }
        })
      }
      return await send(request)
    }
  }
}

export async function migrateRemote(
  executor: SqlitergExecutor,
  migrationQueryMap: MigrationQueryMap,
  queriesStringMap: QueriesStringMap,
) {
  const response = await executor.execute('PRAGMA user_version', {})
  if (!('results' in response)) {
    throw Error('migrateRemote: unreachable code - unable to get user_version')
  }
  if (response.results.length === 0) {
    throw Error('migrateRemote: unreachable code - no result')
  }
  const result = response.results[0]
  if (!result.success) {
    throw Error('migrateRemote: unreachable code - failed result')
  }
  if (!('resultSet' in result)) {
    throw Error('migrateRemote: unreachable code - no result set')
  }

  let [{user_version: currentUserVersion}] = result.resultSet
  while (migrationQueryMap[currentUserVersion]) {
    const migrationQueryPath = migrationQueryMap[currentUserVersion]
    const migrationQueryString = queriesStringMap[migrationQueryPath]
    if (!migrationQueryString) {
      throw new Error(`migrate: could not find query string of ${migrationQueryPath}`)
    }
    const statements =
      migrationQueryString
      .split(';')
      .filter(
        statement => statement.trim().length > 0
      )
    await executor.executeBatchStatements(statements)
    if (currentUserVersion === 0) {
      const path = '/db/0000_seed_default_folder.sql'
      const seedFolderQuery = queriesStringMap[path]
      await executor.execute(seedFolderQuery, {})
    }
    currentUserVersion += 1
    await executor.execute(`PRAGMA user_version = ${currentUserVersion}`, {})
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
    clearAll(): Promise<void>
    clear(): Promise<void>
    isAvailable(): Promise<boolean>
    refresh(): Promise<void>
    migrationStateStore: Readable<string>
  }

export async function createRemoteSnippetStore(
  globalStateStore: Writable<GlobalState>,
  executorStore: Readable<SqlitergExecutor>,
): Promise<RemoteSnippetStore> {
  let remoteDb: SqliteRemoteDatabase
  let executor: SqlitergExecutor
  let snippets: Snippet[] = []
  let folderId = 'default'
  let migrationStateStore: Writable<MigrationState> = writable('not-started')
  // Ideally, we can use an underlying store instead of duplicating the logic
  // like this, but testing yields some really strange type error with `fetch`.
  // Therefore, I resolved to this duplicated logic.
  //
  // Can look at this commit for more detail:
  // https://github.com/thanhguyen2187/crypta/pull/38/commits/157990972cef749af703e0c799026661a436eb5d
  const snippetsStore = writable<Snippet[]>(snippets)
  const globalStateUnsubscribeFn = globalStateStore.subscribe(
    (globalState) => {
      folderId = globalState.folderId
    }
  )
  async function refresh() {
    const dbSnippets = await querySnippetsByFolderId(remoteDb, folderId)
    snippets = dbSnippets.map(
      (dbSnippet) => dbSnippetToDisplaySnippet(dbSnippet, {})
    )
    snippetsStore.set(snippets)
  }
  const executorUnsubscribeFn = executorStore.subscribe(
    async (executor_) => {
      executor = executor_
      if (
        !await executor.isReachable() ||
        !await executor.isAuthenticated()
      ) {
        migrationStateStore.set('not-started')
        return
      }

      migrationStateStore.set('running')
      try {
        await migrateRemote(
          executor,
          defaultMigrationQueryMap,
          defaultQueriesStringMap,
        )
        remoteDb = createRemoteDb(executor)
        migrationStateStore.set('done')
      } catch (e) {
        console.error('createRemoteSnippetStore: executorStore.subscribe ', e)
        migrationStateStore.set('error')
      }
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
    const migrationDone = (get(migrationStateStore) === 'done')
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
        globalStateUnsubscribeFn()
      }
    },
    async clone(snippet: Snippet) {
      if (!await isAvailable()) {
        return
      }

      const clonedSnippet: Snippet = {
        ...snippet,
        id: crypto.randomUUID(),
        position: snippets.length + 1,
        tags: snippet.tags.slice(),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }
      const dbSnippet = displaySnippetToDbSnippet(folderId, clonedSnippet)
      await upsertSnippet(remoteDb, dbSnippet)
      if (snippet.tags.length > 0) {
        await upsertTags(remoteDb, clonedSnippet.id, snippet.tags)
      }
      snippets.push(clonedSnippet)

      snippetsStore.set(snippets)
    },
    async upsert(snippet: Snippet) {
      if (!await isAvailable()) {
        return
      }

      const dbSnippet = displaySnippetToDbSnippet(folderId, snippet)
      await upsertSnippet(remoteDb, dbSnippet)
      if (snippet.tags && snippet.tags.length > 0) {
        await clearTags(remoteDb, snippet.id)
        await upsertTags(remoteDb, snippet.id, snippet.tags)
      }
      const index = snippets.findIndex(snippet_ => snippet_.id === snippet.id)
      if (index === -1) {
        snippets.push(snippet)
        snippetsStore.set(snippets)
        return
      }

      snippets[index] = snippet
      snippetsStore.set(snippets)
    },
    async remove(id: string) {
      if (!await isAvailable()) {
        return
      }

      await deleteSnippet_(remoteDb, id)
      const index = snippets.findIndex(snippet => snippet.id === id)
      snippets.splice(index, 1)

      snippetsStore.set(snippets)
    },
    async move(
      movingSnippet: Snippet,
      sourceFolderId: string,
      destinationFolderId: string,
    ) {
      if (!await isAvailable()) {
        return
      }

      const dbSnippet = displaySnippetToDbSnippet(sourceFolderId, movingSnippet)
      dbSnippet.folderId = destinationFolderId
      await upsertSnippet(remoteDb, dbSnippet)

      const index = snippets.findIndex(snippet => snippet.id === movingSnippet.id)
      snippets.splice(index, 1)

      snippetsStore.set(snippets)
    },
    async clear() {
      if (!await isAvailable()) {
        return
      }

      snippets = []
      snippetsStore.set(snippets)

      await deleteSnippetsByFolder(remoteDb, folderId)
    },
    async clearAll() {
      if (!await isAvailable()) {
        return
      }

      snippets = []
      snippetsStore.set(snippets)

      await deleteAllSnippets(remoteDb)
    },
    isAvailable,
    refresh,
    migrationStateStore,
  }
}
