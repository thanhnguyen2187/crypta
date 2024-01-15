import { writable } from 'svelte/store'
import type { Updater, Writable } from 'svelte/store'

export type Log = {
  date: number
  content: string
}

export const logsStore = writable<Log[]>([])

export function logToLine(log: Log): string {
  return `${(new Date(log.date)).toLocaleString()}: ${log.content}`
}
