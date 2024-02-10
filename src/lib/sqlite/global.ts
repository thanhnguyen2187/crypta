import { createLocalDb, createLocalSnippetsStore, createQueryExecutor, createSQLiteAPIV2 } from './wa-sqlite'
import { derived } from 'svelte/store'
import { globalStateStore, settingsStore } from '$lib/utitlities/global'
import { createRemoteSnippetStore, createSqlitergExecutor } from '$lib/sqlite/sqliterg'
import { createSnippetsDataManager, createSnippetsDataStateStore } from '$lib/utitlities/synchronization'
import { waitUntil } from '$lib/utitlities/wait-until'
import { get } from 'svelte/store'

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
export const remoteSnippetsStore = await createRemoteSnippetStore(globalStateStore, sqlitergExecutorStore)
await waitUntil(remoteSnippetsStore.isAvailable)

export const dataStateStore = createSnippetsDataStateStore(localSnippetsStore, remoteSnippetsStore)
export const dataManager = createSnippetsDataManager(localSnippetsStore, remoteSnippetsStore, dataStateStore, 5_000)
dataManager.start()
