import { derived, get, readable, writable } from 'svelte/store'
import type { Settings } from '../../utitlities/persistence'
import { defaultSettings, readSettings, writeSettings } from '../../utitlities/persistence'
import { throttle } from '$lib/utitlities/throttle';

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
export const dialogSettingsStateStore = derived(
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

export function createConnectionStateStore() {
  let state: ConnectionState = 'blank'
  const {set, update, subscribe} = writable<ConnectionState>(state)
  type Action = 'clearInput' | 'userInput' | 'connectError' | 'connectSuccess'

  function moveState(action: Action) {
    switch (action) {
      case 'userInput':
        state = 'connecting'
        break
      case 'connectError':
        state = 'error'
        break
      case 'connectSuccess':
        state = 'connected'
        break
      case 'clearInput':
        state = 'blank'
        break
    }
    set(state)
  }

  const [onSettingsChanged, cancelOnSettingsChanged] = throttle(
    (settings: Settings) => {
      if (!settings.serverURL) {
        moveState('clearInput')
      } else {
        moveState('userInput')
      }
    },
    2_000, // 2 second
  )
  dialogSettingsStore.subscribe(onSettingsChanged, cancelOnSettingsChanged)

  return {
    subscribe,
  }
}
