import type { QueryExecutor } from './query-executor'
import { readCatalog, readSnippets } from '$lib/utitlities/persistence'
import { fetchRawString } from '$lib/utitlities/fetch-raw-string';
import { sql } from 'drizzle-orm'
import { localDb } from '$lib/sqlite/global';
import { folders, snippets } from '$lib/sqlite/schema';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';

export type MigrationQueryMap = {[userVersion: number]: string}

export const defaultMigrationQueryMap: MigrationQueryMap = {
  0: '0000_calm_gamma_corps.sql',
}

export async function migrate(executor: QueryExecutor, migrationQueryMap: MigrationQueryMap) {
  let [[currentUserVersion]] = await executor.execute('PRAGMA user_version') as [[number]]
  while (migrationQueryMap[currentUserVersion]) {
    const migrationQueryName = migrationQueryMap[currentUserVersion]
    const migrationQuery = await fetchRawString(`queries/${migrationQueryName}`)
    await executor.execute(migrationQuery)
    if (currentUserVersion === 0) {
      // await v0DataImport(localDb)
      const name = '0000_seed_default_folder.sql'
      const seedFolderQuery = await fetchRawString(`queries/${name}`)
      await executor.execute(seedFolderQuery)
    }
    currentUserVersion += 1
    // TODO: investigate why using `?` within the query doesn't work
    await executor.execute(`PRAGMA user_version = ${currentUserVersion}`)
  }

  // debugger
  await v0DataImport(localDb)
  console.log(await localDb.select().from(folders))
  console.log(await localDb.select().from(snippets))
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
    // .onConflictDoNothing()
    .onConflictDoUpdate({
      target: folders.id,
      set: {
        name: sql`excluded.name`,
        position: sql`excluded.position`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
    })
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
    }
  }
}
