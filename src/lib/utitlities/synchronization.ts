import type { Invalidator, Readable, Subscriber, Unsubscriber, Writable } from 'svelte/store'
import type { Snippet, SnippetStore } from '$lib/utitlities/persistence';
import type { RemoteSnippetStore } from '$lib/sqlite/sqliterg';
import { derived, get, writable } from 'svelte/store';

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
type SnippetMap = {[id: string]: Snippet}

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
): SnippetsDataManager {
  return {
    start(): void {
      setInterval(
        async () => {
          for (const [id, state] of Object.values(get(stateStore))) {
            if (state === 'remote-only') {
              const localSnippet = get(stateStore.remoteMap)[id]
              await localStore.upsert(localSnippet)
            }
            if (state === 'local-only') {
              const localSnippet = get(stateStore.localMap)[id]
              await remoteStore.upsert(localSnippet)
            }
          }
        },
        5_000,
      )
    },
    async merge(snippet: Snippet): Promise<void> {
      await localStore.upsert(snippet)
      await remoteStore.upsert(snippet)
    }
  }
}