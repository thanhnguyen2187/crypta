import { derived } from 'svelte/store';
import { settingsStore } from '$lib/utitlities/ephemera';

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

export type Result = ResultTrue | ResultFalse

export type Response = {
  results: Result[]
}

export type SqlitergExecutor = {
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
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authBase64}`,
        },
        body: JSON.stringify(request)
      },
    )
    return await response.json()
  }
  return {
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

export const sqliteExecutorStore = derived(
  settingsStore,
  (settings) => {
    return createSqlitergExecutor(
      settings.serverURL,
      settings.username,
      settings.password,
    )
  }
)
