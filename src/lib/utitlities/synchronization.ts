import type { Invalidator, Readable, Subscriber, Unsubscriber, Writable } from 'svelte/store'
import type { SnippetStore } from '$lib/utitlities/persistence';
import type { RemoteSnippetStore } from '$lib/sqlite/sqliterg';
import { derived, writable } from 'svelte/store';

/**
 * Represents data state of an in-memory record:
 *
 * - `no-remote`: the remote store is not available.
 * - `synchronized`: the record exists on both local and remote, and the two
 *   versions do not differ.
 * - `conflicted`: local version and remote version differs.
 * */
type DataState =
  | 'no-remote'
  | 'synchronized'
  | 'conflicted'

type DataStateMap = {[id: string]: DataState}

type SnippetsDataStateStore =
  Readable<DataStateMap> &
  {
    getState(snippetId: string): Promise<DataState>
  }

export function createSnippetsDataStateStore(
  localStore: SnippetStore,
  remoteStore: RemoteSnippetStore,
): SnippetsDataStateStore {
  const map: DataStateMap = {}
  const mapStore = writable(map)
  derived(
    [localStore, remoteStore],
    ([localSnippets, remoteSnippets]) => {

    }
  )

  return {
    subscribe: mapStore.subscribe,
    async getState(snippetId: string): Promise<DataState> {
      if (!await remoteStore.isAvailable()) {
        return 'no-remote'
      }

      return 'synchronized'
    }
  }
}
