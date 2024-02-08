import { sql } from 'drizzle-orm'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

export type MigrationQueryMap = {[userVersion: number]: string}
export type QueriesStringMap = {[path: string]: string}

export const defaultMigrationQueryMap: MigrationQueryMap = {
  0: '/db/0000_mushy_black_queen.sql',
}
export const defaultQueriesStringMap: QueriesStringMap =
  import.meta.glob('/db/*.sql', {as: 'raw', eager: true})

export type MigrationState = 'not-started' | 'running' | 'done' | 'error'
export const migrationStateStore = writable<MigrationState>('not-started')

export async function migrate(
  db: SqliteRemoteDatabase,
  stateStore: Writable<MigrationState>,
  dataImportFn: (db: SqliteRemoteDatabase) => Promise<void>,
  migrationQueryMap: MigrationQueryMap,
  queriesStringMap: QueriesStringMap,
) {
  stateStore.set('running')
  let [currentUserVersion] = await db.get<[number]>(sql`PRAGMA user_version`)
  while (migrationQueryMap[currentUserVersion]) {
    const migrationQueryPath = migrationQueryMap[currentUserVersion]
    const migrationQueryString = queriesStringMap[migrationQueryPath]
    if (!migrationQueryString) {
      console.error(`migrate: could not find query string of ${migrationQueryPath}`)
      return
    }
    const statements =
      migrationQueryString
      .split(';')
      .filter(statement => statement.trim().length > 0)
    for (const statement of statements) {
      await db.run(sql.raw(statement))
    }
    if (currentUserVersion === 0) {
      try {
        await dataImportFn(db)
      }
      catch (e) {
        console.error('migrate: unable to import v0 data')
        console.error(e)
      }
      const path = '/db/0000_seed_default_folder.sql'
      const seedFolderQuery = queriesStringMap[path]
      await db.run(sql.raw(seedFolderQuery))
    }
    // TODO: investigate why using `?` within the query doesn't work
    currentUserVersion += 1
    await db.run(sql.raw(`PRAGMA user_version = ${currentUserVersion}`))
  }

  stateStore.set('done')
}

