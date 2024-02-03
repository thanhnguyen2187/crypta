import { writable } from 'svelte/store'
import type { Updater, Writable } from 'svelte/store'

export type Log = {
  date: Date
  content: string | object
}

export type LogsStore = Writable<Log[]> &
  {
    addLog(content: string | object): void
  }

export type InputState = {
  display: 'none' | 'warning' | 'error' | 'success'
  message: string
}

export const defaultInputState: InputState = {
  display: 'none',
  message: '',
}

export function createLogsStore(): LogsStore {
  let logs: Log[] = []
  const store = writable<Log[]>([])

  return {
    set(value: Log[]) {
      logs = value
      store.set(value)
    },
    update(updater: Updater<Log[]>) {
      logs = updater(logs)
      store.set(logs)
    },
    subscribe: store.subscribe,
    addLog(content: string | object) {
      const newLog: Log = {
        date: new Date(),
        content,
      }
      logs.push(newLog)
      store.set(logs)
    }
  }
}

export const logsStore = createLogsStore()

export const inputStateStore = writable<InputState>(defaultInputState)

export function logToLine(log: Log): string {
  const logContentStr = typeof log.content === 'string'
    ? log.content
    : JSON.stringify(log.content)
  return `${log.date.toLocaleString()}: ${logContentStr}`
}
