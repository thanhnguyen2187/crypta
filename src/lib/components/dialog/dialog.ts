import { derived, get, readable, writable } from 'svelte/store'
import type { Readable } from 'svelte/store'
import type { Settings } from '../../utitlities/persistence'
import { defaultSettings, readSettings, writeSettings } from '../../utitlities/persistence'
import { throttle } from '$lib/utitlities/throttle';
import { debounce } from '$lib/utitlities/debounce';

export type DialogState =
  'hidden' |
  'confirm' |
  'password' |
  'new-private-card' |
  'settings'

export type ConnectionState =
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
export const dialogSettingsStateStore: Readable<ConnectionState> = createConnectionStateStore()
export const dialogSettingsStateStore_ = derived(
  dialogTickerStore,
  async () => {
    // TODO: implement state where it is erred, but the settings also changed
    try {
      const settings = get(dialogSettingsStore)
      if (!settings.serverURL) {
        return 'blank' as ConnectionState
      }
      const encodedAuthorization = Buffer.from(`${settings.username}:${settings.password}`).toString('base64')
      const response = await fetch(
        `${settings.serverURL}/api/v1/alive`,
        {
          headers: {
            Authorization: `Basic ${encodedAuthorization}`
          },
        },
      )
      const responseJSON = await response.json()

      if (responseJSON.alive) {
        return 'connected' as ConnectionState
      }
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
    }

    return 'error' as ConnectionState
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

export function createConnectionStateStore(): Readable<ConnectionState> {
  const store = writable<ConnectionState>('blank')
  const {set, update, subscribe} = store

  async function checkConnection(settings: Settings) {
    if (!settings.serverURL) {
      return
    }

    const encodedAuthorization = Buffer.from(`${settings.username}:${settings.password}`).toString('base64')
    const response = await fetch(
      `${settings.serverURL}/api/v1/alive`,
      {
        headers: {
          Authorization: `Basic ${encodedAuthorization}`
        },
      },
    )
    if (response.status !== 200) {
      set('error')
      return
    }

    set('connected')
  }

  dialogSettingsStore.subscribe(
    (settings) => {
      if (!settings.serverURL) {
        set('blank')
        return
      }
      set('connecting')
    }
  )
  dialogSettingsStore.subscribe(
    debounce(checkConnection, 2_000)
  )
  dialogTickerStore.subscribe(
    () => {
      const settings = get(dialogSettingsStore)
      checkConnection(settings)
    }
  )

  return {
    subscribe,
  }
}
