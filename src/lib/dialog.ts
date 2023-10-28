import { derived, get, readable, writable } from 'svelte/store'
import type { Settings } from './persistence'
import { defaultSettings, readSettings, writeSettings } from './persistence'

export type DialogState =
  'hidden' |
  'confirm' |
  'password' |
  'new-private-card' |
  'settings'

export type SettingsState =
  'blank' |
  'connecting' |
  'connected' |
  'error'

export const dialogStateStore = writable<DialogState>('hidden')
export const dialogPasswordStore = writable('')
export const dialogContentStore = writable('')
export const dialogActionStore = writable<(() => void) | undefined>()
export const dialogSettingsStore = writable<Settings>(await readSettings())
export const dialogTickerStore = createTickerStore(5000)
export const dialogSettingsStateStore = derived(
  dialogTickerStore,
  async () => {
    // TODO: implement state where it is erred, but the settings also changed
    try {
      const settings = get(dialogSettingsStore)
      if (!settings.serverURL) {
        return 'blank' as SettingsState
      }
      await fetch(`${settings.serverURL}/api/v1/alive`)
      return 'connected' as SettingsState
    } catch (error: unknown) {
      if (error instanceof TypeError) {
        console.error({
          message: 'check server alive error',
          error,
        })
      } else {
        console.error({
          message: 'unknown type error',
          error,
        })
      }
      return 'error' as SettingsState
    }
  })

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

export function createTickerStore(intervalMs: number = 1000) {
  return readable(new Date(), (set) => {
    set(new Date())

    const interval = setInterval(() => {
      set(new Date())
    }, intervalMs)

    return () => clearInterval(interval)
  })
}
