import { writable } from 'svelte/store'

export type DialogState = 'hidden' | 'confirm'

export const dialogStore = writable<DialogState>('confirm')
