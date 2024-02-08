import { createLocalDb, createLocalSnippetsStore, createQueryExecutor, createSQLiteAPIV2 } from './wa-sqlite'
import { derived } from 'svelte/store'
import { globalStateStore, settingsStore } from '$lib/utitlities/global'
import { createSqlitergExecutor } from '$lib/sqlite/sqliterg'

export const sqlite3 = await createSQLiteAPIV2()
export const executor = await createQueryExecutor(sqlite3, 'crypta')
export const localDb = createLocalDb(executor)
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
export const localSnippetsStore = await createLocalSnippetsStore(executor, globalStateStore)
