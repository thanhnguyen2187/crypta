import { writable } from 'svelte/store'
import type { Readable } from 'svelte/store'
import { readGlobalState } from '$lib/utitlities/persistence'
import type { GlobalState } from '$lib/utitlities/persistence'

export type GlobalStateStore =
  Readable<GlobalState> &
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
    addTag: (tag: string) => {
      tags.add(tag)
      state.tags = Array.from(tags)
      store.set(state)
    },
    removeTag: (tag: string) => {
      tags.delete(tag)
      state.tags = Array.from(tags)
      store.set(state)
    },
    setSearchInput: (input: string) => {
      state.searchInput = input
      store.set(state)
    },
    setFolderId: (folderId: string) => {
      state.folderId = folderId
      store.set(state)
    },
  }
}

export function createTagsStore() {
  const tags: Set<string> = new Set()
  const store = writable<Set<string>>(tags)

  return {
    add: (newTag: string) => {
      tags.add(newTag)
      store.set(tags)
    },
    remove: (oldTag: string) => {
      tags.delete(oldTag)
      store.set(tags)
    },
    subscribe: store.subscribe,
  }
}

export const globalTagsStore = createTagsStore()
export const globalSearchStore = writable<string>('')
export const globalFolderIdStore = writable<string>('default')
