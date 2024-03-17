import { derived, writable } from 'svelte/store'
import type { Readable } from 'svelte/store'
import { remoteDbPairStore } from '$lib/sqlite/global';

export type InputState = {
  display: 'none' | 'warning' | 'error' | 'success'
  message: string
}

export const defaultInputState: InputState = {
  display: 'none',
  message: '',
}

export const inputStateStore = derived(
  remoteDbPairStore,
  ([state]) => {
    let display = ''
    let message = ''
    switch (state) {
      case 'blank':
        display = 'none'
        message = ''
        break
      case 'connected':
        display = 'success'
        message = 'Connected successfully!'
        break
      case 'error-unreachable':
        display = 'warning'
        message = 'Please check if the designated URL is reachable.'
        break
      case 'error-invalid-endpoint':
        display = 'warning'
        message = 'Please check if the designated URL is valid.'
        break
      case 'error-unauthenticated':
        display = 'warning'
        message = 'Please check your token.'
        break
      default:
        display = 'error'
        message = 'Unreachable code'
        break
    }

    return {
      display,
      message,
    }
  }
) as Readable<InputState>
