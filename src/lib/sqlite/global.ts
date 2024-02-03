import { createQueryExecutor, createSQLiteAPI } from './query-executor'
import type { QueryExecutor } from './query-executor'
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import type { ResultTrue, SqlitergExecutor } from '$lib/sqlite/sqliterg';

export async function createLocalDb(executor: QueryExecutor) {
  return drizzle(async (queryString, params, method) => {
    const result = await executor.execute(queryString, ...params)
    if (method === 'get' && result.length > 0) {
      return {rows: result[0]}
    }
    return {rows: result}
  })
}

export async function createRemoteDb(executor: SqlitergExecutor) {
  return drizzle(async (queryString, params, method) => {
    const response = await executor.execute(queryString, params)
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

export const sqlite3 = await createSQLiteAPI()
export const executor = await createQueryExecutor(sqlite3, 'crypta')
export const localDb = await createLocalDb(executor)
