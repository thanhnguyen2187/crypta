import { writable } from 'svelte/store'

export type InputState = {
  display: 'none' | 'warning' | 'error' | 'success'
  message: string
}

export const defaultInputState: InputState = {
  display: 'none',
  message: '',
}

export const inputStateStore = writable<InputState>(defaultInputState)
