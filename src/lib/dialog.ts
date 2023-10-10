import { writable } from 'svelte/store'

export type DialogState = 'hidden' | 'confirm' | 'password'

export const dialogStateStore = writable<DialogState>('hidden')
export const dialogPasswordStore = writable('')
export const dialogActionStore = writable<(() => void) | undefined>()
