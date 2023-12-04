import { writable } from 'svelte/store'
import type { Readable } from 'svelte/store'

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
