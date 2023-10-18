import { get, writable } from 'svelte/store'

export type DialogState =
  'hidden' |
  'confirm' |
  'password' |
  'new-private-card' |
  'settings'

export const dialogStateStore = writable<DialogState>('hidden')
export const dialogPasswordStore = writable('')
export const dialogContentStore = writable('')
export const dialogActionStore = writable<(() => void) | undefined>()

/**
 * Display a prompt for password, then do a certain action/callback after the
 * password input is finished.
 * */
export function promptPassword(action: () => void) {
  dialogStateStore.set('password')
  dialogActionStore.set(action)
}

export function promptNewPrivateCard(content: string, action: () => void) {
  dialogStateStore.set('new-private-card')
  dialogActionStore.set(action)
  dialogContentStore.set(content)
}

export function promptSettings() {
  dialogStateStore.set('settings')
}

/**
 * Get the current password after password prompt is finished.
 * */
export function getCurrentPassword(): string {
  return get(dialogPasswordStore)
}
