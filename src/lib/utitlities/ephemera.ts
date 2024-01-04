import { writable } from 'svelte/store'
import type { Writable, Updater } from 'svelte/store'
import { readGlobalState, writeGlobalState } from '$lib/utitlities/persistence'
import type { GlobalState } from '$lib/utitlities/persistence'

export type GlobalStateStore =
  Writable<GlobalState> &
  {
    addTag: (tag: string) => void
    removeTag: (tag: string) => void
    setSearchInput: (input: string) => void
    setFolderId: (folderId: string) => void
  }

export async function createGlobalStateStore(): Promise<GlobalStateStore> {
  const state = await readGlobalState()
  const tags: Set<string> = new Set(state.tags)
  const store = writable(state)

  return {
    subscribe: store.subscribe,
    set(value: GlobalState) {
      writeGlobalState(value).then()
      store.set(value)
    },
    update(updater: Updater<GlobalState>) {
      const value = updater(state)
      writeGlobalState(value).then()
      store.set(value)
    },
    addTag: (tag: string) => {
      tags.add(tag)
      state.tags = Array.from(tags)
      writeGlobalState(state).then()
      store.set(state)
    },
    removeTag: (tag: string) => {
      tags.delete(tag)
      state.tags = Array.from(tags)
      writeGlobalState(state).then()
      store.set(state)
    },
    setSearchInput: (input: string) => {
      state.searchInput = input
      writeGlobalState(state).then()
      store.set(state)
    },
    setFolderId: (folderId: string) => {
      state.folderId = folderId
      writeGlobalState(state).then()
      store.set(state)
    },
  }
}

export const globalFolderIdStore = writable<string>('default')
export const globalStateStore = await createGlobalStateStore()
