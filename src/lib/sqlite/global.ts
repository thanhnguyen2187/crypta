import { createQueryExecutor, createSQLiteAPI } from './query-executor'
import type { QueryExecutor } from './query-executor'
import { drizzle } from 'drizzle-orm/sqlite-proxy';

export async function createLocalDb(executor: QueryExecutor) {
  return drizzle(async (sql, params, method) => {
    debugger
    return {rows: []}
  })
}

export const sqlite3 = await createSQLiteAPI()
export const executor = await createQueryExecutor(sqlite3, 'crypta')
export const localDb = await createLocalDb(executor)
