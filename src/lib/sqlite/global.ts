import { createQueryExecutor, createSQLiteAPI } from './wa-sqlite'
import type { WASqliteExecutor } from './wa-sqlite'
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import { derived } from 'svelte/store';
import { settingsStore } from '$lib/utitlities/global';
import { createSqlitergExecutor } from '$lib/sqlite/sqliterg';

export async function createLocalDb(executor: WASqliteExecutor) {
  return drizzle(async (queryString, params, method) => {
    const result = await executor.execute(queryString, ...params)
    if (method === 'get' && result.length > 0) {
      return {rows: result[0]}
    }
    return {rows: result}
  })
}

export const sqlite3 = await createSQLiteAPI()
export const executor = await createQueryExecutor(sqlite3, 'crypta')
export const localDb = await createLocalDb(executor)
export const sqlitergExecutorStore = derived(
  settingsStore,
  (settings) => {
    return createSqlitergExecutor(
      settings.serverURL,
      settings.username,
      settings.password,
    )
  }
)
