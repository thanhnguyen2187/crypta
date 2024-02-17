import type { Invalidator, Readable, Subscriber, Unsubscriber, Writable } from 'svelte/store'
import type {
  LocalFoldersStore,
  RemoteFoldersStore,
  Snippet,
  SnippetStore
} from '$lib/utitlities/persistence'
import type { RemoteSnippetStore } from '$lib/sqlite/sqliterg'
import { derived, get, writable } from 'svelte/store'
import type { DisplayFolder } from '$lib/utitlities/data-transformation';

/**
 * Represents data state of an in-memory record:
 *
 * - `local-only`: the record is only available locally.
 * - `remote-only`: the record is only available remotely.
 * - `synchronized`: the record exists on both local and remote, and the two
 *   versions do not differ.
 * - `conflicted`: local version and remote version differs.
 * */
type DataState =
  | 'local-only'
  | 'remote-only'
  | 'synchronized'
  | 'conflicted'

type DataStateMap = {[id: string]: DataState}
export type SnippetMap = {[id: string]: Snippet}

type SnippetsDataStateStore =
  Readable<DataStateMap> &
  {
    localMap: Readable<SnippetMap>
    remoteMap: Readable<SnippetMap>
  }
type SnippetsDataManager = {
  start(): void
  merge(snippet: Snippet): Promise<void>
}

export function createSnippetsDataStateStore(
  localStore: Readable<Snippet[]>,
  remoteStore: Readable<Snippet[]>,
): SnippetsDataStateStore {
  const map = derived(
    [localStore, remoteStore],
    ([localSnippets, remoteSnippets]) => {
      const map: DataStateMap = {}
      const localMap: {[key: string]: Snippet} = {}
      for (const localSnippet of localSnippets) {
        map[localSnippet.id] = 'local-only'
        localMap[localSnippet.id] = localSnippet
      }
      for (const remoteSnippet of remoteSnippets) {
        if (map[remoteSnippet.id] === 'local-only') {
          const localSnippet = localMap[remoteSnippet.id]
          if (localSnippet.updatedAt === remoteSnippet.updatedAt) {
            map[remoteSnippet.id] = 'synchronized'
          } else {
            map[remoteSnippet.id] = 'conflicted'
          }
        } else {
          map[remoteSnippet.id] = 'remote-only'
        }
      }
      return map
    }
  )
  const localMap = derived(
    localStore,
    (localSnippets) => {
      const localMap: {[key: string]: Snippet} = {}
      for (const localSnippet of localSnippets) {
        localMap[localSnippet.id] = localSnippet
      }
      return localMap
    }
  )
  const remoteMap = derived(
    remoteStore,
    (remoteSnippets) => {
      const remoteMap: {[key: string]: Snippet} = {}
      for (const remoteSnippet of remoteSnippets) {
        remoteMap[remoteSnippet.id] = remoteSnippet
      }
      return remoteMap
    }
  )

  return {
    subscribe: map.subscribe,
    localMap,
    remoteMap,
  }
}

export function createSnippetsDataManager(
  localStore: SnippetStore,
  remoteStore: RemoteSnippetStore,
  stateStore: SnippetsDataStateStore,
  intervalMs: number = 3_000,
): SnippetsDataManager {
  return {
    start(): void {
      setInterval(
        async () => {
          await remoteStore.refresh()
          for (const [id, state] of Object.entries(get(stateStore))) {
            if (state === 'remote-only') {
              const remoteSnippet = get(stateStore.remoteMap)[id]
              await localStore.upsert(remoteSnippet)
            }
            if (state === 'local-only') {
              const localSnippet = get(stateStore.localMap)[id]
              await remoteStore.upsert(localSnippet)
            }
          }
        },
        intervalMs,
      )
    },
    async merge(snippet: Snippet): Promise<void> {
      snippet.updatedAt = new Date().getTime()
      await localStore.upsert(snippet)
      await remoteStore.upsert(snippet)
    }
  }
}

export function createHigherSnippetsStore(
  localStore: SnippetStore,
  remoteStore: RemoteSnippetStore,
): SnippetStore {
  return {
    subscribe: localStore.subscribe,
    async move(movingSnippet: Snippet, sourceFolderId: string, destinationFolderId: string): Promise<void> {
      await localStore.move(movingSnippet, sourceFolderId, destinationFolderId)
      if (await remoteStore.isAvailable()) {
        await remoteStore.move(movingSnippet, sourceFolderId, destinationFolderId)
      }
    },
    async remove(id: string): Promise<void> {
      await localStore.remove(id)
      if (await remoteStore.isAvailable()) {
        await remoteStore.remove(id)
      }
    },
    async upsert(snippet: Snippet): Promise<void> {
      await localStore.upsert(snippet)
      if (await remoteStore.isAvailable()) {
        await remoteStore.upsert(snippet)
      }
    },
    async clone(snippet: Snippet): Promise<void> {
      await localStore.clone(snippet)
      if (await remoteStore.isAvailable()) {
        await remoteStore.clone(snippet)
      }
    },
    async clearAll(): Promise<void> {
      await localStore.clearAll()
      if (await remoteStore.isAvailable()) {
        await remoteStore.clearAll()
      }
    },
    migrationStateStore: localStore.migrationStateStore
  }
}

/**
 * Create one store that combine the data of local and remote folders. It also
 * "auto merge" the data following "last write wins" rule.
 *
 * In more details:
 *
 * - If one folder exists within the local store but not within the remote
 *   store, then the folder would be created within the remote store, and vice
 *   versa.
 * - If the folder within both stores, then the "newer" folder (one that has
 *   greater `updatedAt` value) would be used and be written to both stores.
 *
 * This strategy is much simpler than `createHigherSnippetsStore`'s strategy
 * basing on an assumption: the snippets' data is important and conflicts should
 * be resolved instead of letting data be overwritten.
 * */
export function createHigherFoldersStore(
  localStore: LocalFoldersStore,
  remoteStore: RemoteFoldersStore,
): LocalFoldersStore {
  const store = derived(
    [localStore, remoteStore],
    ([localFolders, remoteFolders]) => {
      const allFolders: {[key: string]: DisplayFolder} = {}
      for (const localFolder of localFolders) {
        allFolders[localFolder.id] = localFolder
      }
      for (const remoteFolder of remoteFolders) {
        if (remoteFolder.id in allFolders) {
          const localFolder = allFolders[remoteFolder.id]
          if (remoteFolder.updatedAt > localFolder.updatedAt) {
            allFolders[remoteFolder.id] = remoteFolder
            localStore.upsert(remoteFolder).then()
          } else {
            remoteStore.upsert(localFolder).then()
          }
        } else {
          allFolders[remoteFolder.id] = remoteFolder
          localStore.upsert(remoteFolder).then()
        }
      }
      return Object.values(allFolders)
    }
  )

  return {
    subscribe: store.subscribe,
    async upsert(folder: DisplayFolder): Promise<void> {
      await localStore.upsert(folder)
      if (await remoteStore.isAvailable()) {
        await remoteStore.upsert(folder)
      }
    },
    async delete(id: string): Promise<void> {
      await localStore.delete(id)
      if (await remoteStore.isAvailable()) {
        await remoteStore.delete(id)
      }
    },
  }
}
