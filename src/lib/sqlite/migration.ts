import type { QueryExecutor } from './query-executor'
import { readCatalog, readSnippets } from '$lib/utitlities/persistence'
import { sql } from 'drizzle-orm'
import { localDb } from '$lib/sqlite/global'
import { folders, snippet_tags, snippets } from './schema'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';

export type MigrationQueryMap = {[userVersion: number]: string}
export type QueriesStringMap = {[path: string]: string}

export const defaultMigrationQueryMap: MigrationQueryMap = {
  0: '/db/0000_sloppy_strong_guy.sql',
}
export const defaultQueriesStringMap: QueriesStringMap =
  import.meta.glob('/db/*.sql', {as: 'raw', eager: true})

export async function migrate(
  executor: QueryExecutor,
  migrationQueryMap: MigrationQueryMap,
  queriesStringMap: QueriesStringMap,
) {
  let [[currentUserVersion]] = await executor.execute('PRAGMA user_version') as [[number]]
  while (migrationQueryMap[currentUserVersion]) {
    const migrationQueryPath = migrationQueryMap[currentUserVersion]
    const migrationQueryString = queriesStringMap[migrationQueryPath]
    if (!migrationQueryString) {
      console.error(`migrate: could not find query string of ${migrationQueryPath}`)
      return
    }
    await executor.execute(migrationQueryString)
    if (currentUserVersion === 0) {
      try {
        await v0DataImport(localDb)
      }
      catch (e) {
        console.error('migrate: unable to import v0 data')
        console.error(e)
      }
      const path = '/db/0000_seed_default_folder.sql'
      const seedFolderQuery = queriesStringMap[path]
      await executor.execute(seedFolderQuery)
    }
    // TODO: investigate why using `?` within the query doesn't work
    await executor.execute(`PRAGMA user_version = ${currentUserVersion}`)
  }
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
        createdAt: sql`DATETIME(${snippetRecord.createdAt}, 'unixepoch')`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .onConflictDoNothing()

      for (const tag of snippetRecord.tags) {
        await db
        .insert(snippet_tags)
        .values({
          id: crypto.randomUUID(),
          snippet_id: snippetRecord.id,
          tag_text: tag,
        })
        .onConflictDoNothing()
      }
    }
  }
}
