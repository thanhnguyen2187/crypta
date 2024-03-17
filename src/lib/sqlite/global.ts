import {
  createLocalDb,
  createLocalFoldersStore,
  createLocalSnippetsStore,
  createQueryExecutor,
  createSQLiteAPIV2
} from './wa-sqlite'
import { globalStateStore, settingsV2Store } from '$lib/utitlities/global'
import {
  createDb,
  createRemoteFoldersStore,
  createRemoteSnippetsStore,
  createRemoteSnippetsStoreV2
} from '$lib/sqlite/turso'
import { asyncDerived } from '@square/svelte-store'
import { derived, get } from 'svelte/store';
import {
  createHigherFoldersStore,
  createHigherSnippetsStore,
  createSnippetsDataManager,
  createSnippetsDataStateStore,
  reloadRemoteFoldersStore
} from '$lib/utitlities/synchronization';
import type { MigrationState } from '$lib/sqlite/migration';

export const remoteDbPairStore = asyncDerived(
  [settingsV2Store],
  async ([settings]) => {
    return createDb(settings)
  },
  {
    reloadable: true,
  }
)
await remoteDbPairStore.load()

export const sqlite3 = await createSQLiteAPIV2()
export const executor = await createQueryExecutor(sqlite3, 'crypta')
export const localDb = createLocalDb(executor)
export const localSnippetsStore = await createLocalSnippetsStore(executor, globalStateStore)
export const folderIdStore = derived(
  globalStateStore,
  globalState => globalState.folderId
)
export const remoteSnippetsStore = await createRemoteSnippetsStoreV2(remoteDbPairStore, folderIdStore)
// await waitUntil(remoteSnippetsStore.isAvailable, 100, 1000)
export const higherSnippetsStore = createHigherSnippetsStore(localSnippetsStore, remoteSnippetsStore)
// export const higherSnippetsStore = localSnippetsStore

export const dataStateStore = createSnippetsDataStateStore(localSnippetsStore, remoteSnippetsStore)
export const dataManager = createSnippetsDataManager(localSnippetsStore, remoteSnippetsStore, dataStateStore, 5_000)
dataManager.start()

export const localFoldersStore = await createLocalFoldersStore(localDb, higherSnippetsStore.migrationStateStore)
// export const remoteFoldersStore =
// await remoteFoldersStore.load()
// export const higherFoldersStore = createHigherFoldersStore(localFoldersStore, remoteFoldersStore)
export const higherFoldersStore = localFoldersStore
// reloadRemoteFoldersStore(localFoldersStore, remoteFoldersStore, 3_000)

