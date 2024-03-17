import { readCatalog, readSnippets } from '$lib/utitlities/persistence'
import { sql } from 'drizzle-orm'
import { folders, snippet_tags, snippets } from './schema'
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

export type MigrationState = 'not-started' | 'running' | 'done'
export const migrationStateStore = writable<MigrationState>('not-started')

export async function migrate(
  db: SqliteRemoteDatabase,
  stateStore: Writable<MigrationState>,
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
    await db.run(sql.raw(migrationQueryString))
    if (currentUserVersion === 0) {
      try {
        await v0DataImport(db)
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

export async function v0DataImport(db: SqliteRemoteDatabase) {
  const catalog = await readCatalog()
  const folderRecords = Object.entries(catalog).map(
    ([folderId, folder], index) => {
      return {
        id: folderId,
        name: folder.displayName,
        position: index,
      }
    }
  )
  for (const record of folderRecords) {
    await db
    .insert(folders)
    .values(record)
    .onConflictDoNothing()
  }

  for (const folderRecord of folderRecords) {
    const snippetRecords = await readSnippets(folderRecord.id)
    for (const snippetRecord of snippetRecords) {
      await db
      .insert(snippets)
      .values({
        ...snippetRecord,
        folderId: folderRecord.id,
        // We need to divide by 1000 since JavaScript's timestamp is in
        // nanosecond instead of millisecond.
        createdAt: sql`DATETIME(${(snippetRecord.createdAt / 1000).toFixed()}, 'unixepoch')`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .onConflictDoNothing()

      for (const tag of snippetRecord.tags) {
        await db
        .insert(snippet_tags)
        .values({
          snippetId: snippetRecord.id,
          tagText: tag,
        })
        .onConflictDoNothing()
      }
    }
  }
}
