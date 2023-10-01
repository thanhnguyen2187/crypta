import { writable } from 'svelte/store'

export const toasterText = writable<string | null>(null)
