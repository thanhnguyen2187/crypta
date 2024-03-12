import type { MigrationQueryMap, QueriesStringMap } from '$lib/sqlite/migration'
import { sql } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { asyncDerived, asyncWritable } from '@square/svelte-store'
import type { WritableLoadable, Reloadable } from '@square/svelte-store'
import type { Snippet } from '$lib/utitlities/persistence'
import type { Readable } from 'svelte/store'
import { snippets } from '$lib/sqlite/schema'
import { querySnippetsByFolderId, queryTagsBySnippetIds } from '$lib/sqlite/queries'
import { buildTagsMap, dbSnippetToDisplaySnippet } from '$lib/utitlities/data-transformation'

export async function migrateRemote(
  db: LibSQLDatabase,
  migrationQueryMap: MigrationQueryMap,
  queriesStringMap: QueriesStringMap,
) {
  const response = await db.get(sql`PRAGMA user_version`)
  let {user_version: currentUserVersion} = response as {user_version: number}
  while (migrationQueryMap[currentUserVersion]) {
    const migrationQueryPath = migrationQueryMap[currentUserVersion]
    const migrationQueryString = queriesStringMap[migrationQueryPath]
    if (!migrationQueryString) {
      throw new Error(`migrate: could not find query string of ${migrationQueryPath}`)
    }
    await db.run(sql.raw(migrationQueryString))
    if (currentUserVersion === 0) {
      const path = '/db/0000_seed_default_folder.sql'
      const seedFolderQuery = queriesStringMap[path]
      await db.run(sql.raw(seedFolderQuery))
    }
    currentUserVersion += 1
    await db.run(sql.raw(`PRAGMA user_version = ${currentUserVersion}`))
  }
}

export function createSnippetsStore(db: LibSQLDatabase, folderIdStore: Readable<string>): Reloadable<Snippet[]> {
  return asyncDerived(
    [folderIdStore],
    async ([folderId]) => {
      const dbSnippets = await querySnippetsByFolderId(db, folderId)
      const snippetIds = dbSnippets.map(snippet => snippet.id)
      const tags = await queryTagsBySnippetIds(db, snippetIds)
      const tagsMap = buildTagsMap(tags)
      const snippets = dbSnippets.map(
        (dbSnippet) => dbSnippetToDisplaySnippet(dbSnippet, tagsMap)
      )
      return snippets
    },
    {reloadable: true}
  ) as Reloadable<Snippet[]>
}
