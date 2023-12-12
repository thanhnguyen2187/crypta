import { writable } from 'svelte/store'
import type { Snippet } from '$lib/utitlities/persistence'
import { createNewSnippet } from '$lib/utitlities/persistence'

export const modalSnippetStore = writable<Snippet>(createNewSnippet())
export const modalDestinationFolderStore = writable<string>('default')
