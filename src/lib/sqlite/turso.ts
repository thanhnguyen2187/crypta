import type { MigrationQueryMap, QueriesStringMap } from '$lib/sqlite/migration'
import { sql } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { asyncDerived, asyncReadable, asyncWritable } from '@square/svelte-store'
import type { Loadable } from '@square/svelte-store'
import type { WritableLoadable, Reloadable } from '@square/svelte-store'
import type { Snippet } from '$lib/utitlities/persistence'
import type { Readable } from 'svelte/store'
import { snippets } from '$lib/sqlite/schema'
import { querySnippetsByFolderId, queryTagsBySnippetIds } from '$lib/sqlite/queries'
import { buildTagsMap, dbSnippetToDisplaySnippet } from '$lib/utitlities/data-transformation'
import type { ConnectionState, SettingsV2 } from '$lib/utitlities/ephemera'
import { LibsqlError, createClient } from '@libsql/client'
import { derived } from 'svelte/store'
import { drizzle } from 'drizzle-orm/libsql'

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
    const statements =
      migrationQueryString
      .split(';')
      .filter(
        statement => statement.trim().length > 0
      )
    for (const statement of statements) {
      await db.run(sql.raw(statement))
    }
    if (currentUserVersion === 0) {
      const path = '/db/0000_seed_default_folder.sql'
      const seedFolderQuery = queriesStringMap[path]
      await db.run(sql.raw(seedFolderQuery))
    }
    currentUserVersion += 1
    await db.run(sql.raw(`PRAGMA user_version = ${currentUserVersion}`))
  }
}

export type DbStoreReturn = [
  'connected',
  Readable<LibSQLDatabase>,
] | [
  ConnectionState,
  null,
]

export async function createDbStore(settings: SettingsV2): Promise<DbStoreReturn> {
  if (settings.dbURL === '') {
    return ['blank', null]
  }
  try {
    const store = asyncDerived(
      [],
      async () => {
        const config: {
          url: string,
          authToken: string | undefined,
        } = {
          url: settings.dbURL,
          authToken: undefined,
        }
        if (settings.token !== '') {
          config.authToken = settings.token
        }
        const client = createClient(config)
        const db = drizzle(client)
        await db.run(sql`SELECT 1`)
        return db
      }
    )
    await store.load()
    return ['connected', store]
  } catch (e: unknown) {
    if (e instanceof LibsqlError) {
      if (e.code === 'URL_INVALID') {
        return ['error-unreachable', null]
      }
      if (e.code === 'SERVER_ERROR') {
        // @ts-ignore
        if (e.cause.status === 401) {
          return ['error-unauthenticated', null]
        }
        // @ts-ignore
        if (e.cause.status === 404) {
          return ['error-invalid-endpoint', null]
        }
      }
    }
    if (e instanceof TypeError) {
      if (e.message.startsWith('NetworkError')) {
        return ['error-invalid-endpoint', null]
      }
    }
    console.error(e)
    throw e
  }
}

export function createSnippetsStore(dbStore: Readable<LibSQLDatabase>, folderIdStore: Readable<string>): Reloadable<Snippet[]> {
  return asyncDerived(
    [dbStore, folderIdStore],
    async ([db, folderId]) => {
      const dbSnippets = await querySnippetsByFolderId(db, folderId)
      const snippetIds = dbSnippets.map(snippet => snippet.id)
      const tags = await queryTagsBySnippetIds(db, snippetIds)
      const tagsMap = buildTagsMap(tags)
      const snippets = dbSnippets.map(
        (dbSnippet) => dbSnippetToDisplaySnippet(dbSnippet, tagsMap)
      )
      return snippets
    },
    {
      reloadable: true,
      initial: [],
    }
  ) as Reloadable<Snippet[]>
}
