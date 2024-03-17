import {
  createLocalDb,
  createLocalFoldersStore,
  createLocalSnippetsStore,
  createQueryExecutor,
  createSQLiteAPIV2
} from './wa-sqlite'
import { derived } from 'svelte/store'
import { globalStateStore, settingsStore, settingsV2Store } from '$lib/utitlities/global'
import { createRemoteFoldersStore, createRemoteSnippetStore, createSqlitergExecutor } from '$lib/sqlite/sqliterg'
import {
  createHigherFoldersStore,
  createHigherSnippetsStore,
  createSnippetsDataManager,
  createSnippetsDataStateStore, reloadRemoteFoldersStore
} from '$lib/utitlities/synchronization'
import { waitUntil } from '$lib/utitlities/wait-until'
import { createDbStore } from '$lib/sqlite/turso';
import { asyncDerived } from '@square/svelte-store';

export const sqlite3 = await createSQLiteAPIV2()
export const executor = await createQueryExecutor(sqlite3, 'crypta')
export const localDb = createLocalDb(executor)
export const localSnippetsStore = await createLocalSnippetsStore(executor, globalStateStore)
// export const remoteSnippetsStore = await createRemoteSnippetStore(globalStateStore, sqlitergExecutorStore)
// await waitUntil(remoteSnippetsStore.isAvailable, 100, 1000)
// export const higherSnippetsStore = createHigherSnippetsStore(localSnippetsStore, remoteSnippetsStore)
export const higherSnippetsStore = localSnippetsStore

// export const dataStateStore = createSnippetsDataStateStore(localSnippetsStore, remoteSnippetsStore)
// export const dataManager = createSnippetsDataManager(localSnippetsStore, remoteSnippetsStore, dataStateStore, 5_000)
// dataManager.start()

export const localFoldersStore = await createLocalFoldersStore(localDb, higherSnippetsStore.migrationStateStore)
// export const remoteFoldersStore = createRemoteFoldersStore(sqlitergExecutorStore, remoteSnippetsStore.migrationStateStore)
// export const higherFoldersStore = createHigherFoldersStore(localFoldersStore, remoteFoldersStore)
export const higherFoldersStore = localFoldersStore
// reloadRemoteFoldersStore(localFoldersStore, remoteFoldersStore, 3_000)

export const remoteDbPairStore = asyncDerived(
  [settingsV2Store],
  async ([settings]) => {
    return createDbStore(settings)
  }
)
await remoteDbPairStore.load()
