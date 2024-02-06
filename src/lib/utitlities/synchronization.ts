import type { Invalidator, Readable, Subscriber, Unsubscriber, Writable } from 'svelte/store'
import type { Snippet, SnippetStore } from '$lib/utitlities/persistence';
import type { RemoteSnippetStore } from '$lib/sqlite/sqliterg';
import { derived, writable } from 'svelte/store';

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

type SnippetsDataStateStore =
  Readable<DataStateMap>

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

  return {
    subscribe: map.subscribe,
  }
}
