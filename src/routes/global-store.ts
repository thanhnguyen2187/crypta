import { writable } from 'svelte/store'
import type { Readable } from 'svelte/store'

export function createTagsStore() {
  const tags: string[] = []
  const store = writable<string[]>(tags)

  return {
    add: (newTag: string) => {
      if (tags.findIndex(tag => tag === newTag) !== -1) {
        return
      }
      tags.push(newTag)
      store.set(tags)
    },
    remove: (oldTag: string) => {
      const index = tags.findIndex(tag => tag === oldTag)
      if (index === -1) {
        return
      }
      tags.splice(index, 1)
      store.set(tags)
    },
    subscribe: store.subscribe,
  }
}

export const globalTagsStore = createTagsStore()
