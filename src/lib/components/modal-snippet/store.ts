import { derived, writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import type { Snippet } from '$lib/utitlities/persistence'
import { createNewSnippet } from '$lib/utitlities/persistence'

export const modalSnippetStore = writable<Snippet>(createNewSnippet())
export const modalDestinationFolderStore = writable<string>('default')

export type PickedMap = {
  [key in (keyof Snippet)]: 'local' | 'remote'
}

export const mergeLocalSnippetStore = writable<Snippet>(createNewSnippet())
export const mergeRemoteSnippetStore = writable<Snippet>(createNewSnippet())
export const pickedMapStore = writable<PickedMap>({
  id: 'local',
  name: 'local',
  language: 'local',
  text: 'local',
  tags: 'local',
  encrypted: 'local',
  position: 'local',
  updatedAt: 'local',
  createdAt: 'local',
})
export const builtSnippetStore = derived(
  [mergeLocalSnippetStore, mergeRemoteSnippetStore, pickedMapStore],
  ([localSnippet, remoteSnippet, pickedMap]) => {
    const snippet = {...localSnippet}
    for (const key in pickedMap) {
      const keyTyped = key as keyof Snippet
      if (pickedMap[keyTyped] === 'remote') {
        // @ts-ignore
        snippet[keyTyped] = remoteSnippet[keyTyped]
      }
    }
    return snippet
  }
)

export function setOne(
  pickedMapStore: Writable<PickedMap>,
  key: keyof PickedMap,
  value: 'local' | 'remote',
) {
  pickedMapStore.update((map) => {
    map[key] = value
    return map
  })
}

export function setAll(pickedMapStore: Writable<PickedMap>, value: 'local' | 'remote') {
  pickedMapStore.set({
    id: value,
    name: value,
    language: value,
    text: value,
    tags: value,
    encrypted: value,
    position: value,
    updatedAt: value,
    createdAt: value,
  })
}
