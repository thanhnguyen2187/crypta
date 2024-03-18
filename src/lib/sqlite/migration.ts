import { writable } from 'svelte/store'

export type MigrationQueryMap = {[userVersion: number]: string}
export type QueriesStringMap = {[path: string]: string}

export const defaultMigrationQueryMap: MigrationQueryMap = {
  0: '/db/0000_mushy_black_queen.sql',
}
export const defaultQueriesStringMap: QueriesStringMap =
  import.meta.glob('/db/*.sql', {as: 'raw', eager: true})

export type MigrationState = 'not-started' | 'running' | 'done'
export const migrationStateStore = writable<MigrationState>('not-started')
