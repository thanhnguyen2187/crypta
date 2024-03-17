import type { MigrationQueryMap, MigrationState, QueriesStringMap } from '$lib/sqlite/migration'
import { sql } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { asyncDerived } from '@square/svelte-store'
import type { Reloadable } from '@square/svelte-store'
import type { RemoteFoldersStore, Snippet } from '$lib/utitlities/persistence'
import {
  clearTags,
  deleteAllSnippets,
  querySnippetsByFolderId,
  queryTagsBySnippetIds,
  upsertSnippet,
  deleteSnippet as deleteSnippet_,
  upsertTags, deleteSnippetsByFolder, clearAllTags as clearAllTags_, queryFolders, upsertFolder, deleteFolder,
} from '$lib/sqlite/queries'
import {
  buildTagsMap,
  dbFolderToDisplayFolder,
  dbSnippetToDisplaySnippet,
  displayFolderToDbFolder,
  displaySnippetToDbSnippet
} from '$lib/utitlities/data-transformation'
import type { DisplayFolder } from '$lib/utitlities/data-transformation';
import type { ConnectionState, SettingsV2 } from '$lib/utitlities/ephemera'
import { LibsqlError, createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import type { RemoteSnippetStore } from '$lib/sqlite/sqliterg'
import { derived, get, writable } from 'svelte/store'
import type { Readable } from 'svelte/store'
import { defaultMigrationQueryMap, defaultQueriesStringMap } from '$lib/sqlite/migration'

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

export type DbPair =
  | ['connected', LibSQLDatabase,]
  | [Omit<ConnectionState, 'connected'>, null]

export async function createDb(settings: SettingsV2): Promise<DbPair> {
  if (settings.dbURL === '') {
    return ['blank', null]
  }
  try {
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
    return ['connected', db]
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
    return ['error-unknown', null]
  }
}

export function createSnippetsStore(db: LibSQLDatabase, folderId: string): Reloadable<Snippet[]> {
  return asyncDerived(
    [],
    async () => {
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

export async function createRemoteSnippetsStore(
  db: LibSQLDatabase | null,
  folderId: string,
): Promise<RemoteSnippetStore> {
  const migrationStateStore = writable<MigrationState>('not-started')
  await (async () => {
    if (db === null) {
      return
    }
    try {
      migrationStateStore.set('running')
      await migrateRemote(db, defaultMigrationQueryMap, defaultQueriesStringMap)
      migrationStateStore.set('done')
    } catch (e: unknown) {
      console.error(e)
      migrationStateStore.set('error')
    }
  })()

  let snippetsStore: Reloadable<Snippet[]>
  if (db === null) {
    snippetsStore = asyncDerived(
      [],
      async () => {
        return []
      },
      {
        reloadable: true,
      }
    ) as Reloadable<Snippet[]>
  } else {
    // @ts-ignore
    snippetsStore = createSnippetsStore(db, folderId)
  }
  await snippetsStore.load()

  return {
    subscribe: snippetsStore.subscribe,
    async clone(snippet: Snippet): Promise<void> {
      if (db === null) {
        return
      }

      const clonedSnippet: Snippet = {
        ...snippet,
        id: crypto.randomUUID(),
        position: get(snippetsStore).length + 1,
        tags: snippet.tags.slice(),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }
      const dbSnippet = displaySnippetToDbSnippet(folderId, clonedSnippet)
      await upsertSnippet(db, dbSnippet)
      if (snippet.tags.length > 0) {
        await upsertTags(db, clonedSnippet.id, snippet.tags)
      }

      await snippetsStore.reload()
    },
    async upsert(snippet: Snippet): Promise<void> {
      if (db === null) {
        return
      }

      const dbSnippet = displaySnippetToDbSnippet(folderId, snippet)
      await upsertSnippet(db, dbSnippet)
      if (snippet.tags && snippet.tags.length > 0) {
        await clearTags(db, snippet.id)
        await upsertTags(db, snippet.id, snippet.tags)
      }
      await snippetsStore.reload()
    },
    async remove(id: string): Promise<void> {
      if (db === null) {
        return
      }

      await deleteSnippet_(db, id)
      await snippetsStore.reload()
    },
    async move(
      movingSnippet: Snippet,
      sourceFolderId: string,
      destinationFolderId: string,
    ) {
      if (db === null) {
        return
      }

      const dbSnippet = displaySnippetToDbSnippet(sourceFolderId, movingSnippet)
      dbSnippet.folderId = destinationFolderId
      await upsertSnippet(db, dbSnippet)

      await snippetsStore.reload()
    },
    async clear() {
      if (db === null) {
        return
      }
      await deleteSnippetsByFolder(db, folderId)
      await snippetsStore.reload()
    },
    async clearAll() {
      if (db === null) {
        return
      }
      await deleteAllSnippets(db)
      await snippetsStore.reload()
    },
    async clearAllTags() {
      if (db === null) {
        return
      }
      await clearAllTags_(db)
      await snippetsStore.reload()
    },
    async isAvailable(): Promise<boolean> {
      return db !== null;
    },
    async refresh() {
      await snippetsStore.reload()
    },
    migrationStateStore,
  }
}

export async function createRemoteSnippetsStoreV2(
  dbPairStore: Readable<DbPair>,
  folderIdStore: Readable<string>,
): Promise<RemoteSnippetStore> {
  let underlyingStore: RemoteSnippetStore = {
    subscribe() { return () => {} },
    async clone(snippet: Snippet): Promise<void> {},
    async remove(id: string): Promise<void> {},
    async upsert(snippet: Snippet): Promise<void> {},
    async move(movingSnippet: Snippet, sourceFolderId: string, destinationFolderId: string): Promise<void> {},
    async clearAll(): Promise<void> {},
    async clearAllTags(): Promise<void> {},
    async clear(): Promise<void> {},
    async isAvailable(): Promise<boolean> { return false },
    async refresh(): Promise<void> {},
    migrationStateStore: writable<MigrationState>('not-started'),
  }
  const deriver = asyncDerived(
    [dbPairStore, folderIdStore],
    async ([dbPair, folderId]) => {
      return await createRemoteSnippetsStore(dbPair[1], folderId)
    }
  )
  await deriver.load()
  const unsubscribeFn = deriver.subscribe(value => underlyingStore = value)

  return {
    subscribe: underlyingStore.subscribe,
    async clone(snippet: Snippet): Promise<void> {
      await underlyingStore.clone(snippet)
    },
    async remove(id: string): Promise<void> {
      await underlyingStore.remove(id)
    },
    async upsert(snippet: Snippet): Promise<void> {
      await underlyingStore.upsert(snippet)
    },
    async move(movingSnippet: Snippet, sourceFolderId: string, destinationFolderId: string): Promise<void> {
      await underlyingStore.move(movingSnippet, sourceFolderId, destinationFolderId)
    },
    async clearAll(): Promise<void> {
      await underlyingStore.clearAll()
    },
    async clearAllTags(): Promise<void> {
      await underlyingStore.clearAllTags()
    },
    async clear(): Promise<void> {
      await underlyingStore.clear()
    },
    async isAvailable(): Promise<boolean> {
      return await underlyingStore.isAvailable()
    },
    async refresh(): Promise<void> {},
    get migrationStateStore() {
      return underlyingStore.migrationStateStore
    },
  }
}

export function createFoldersStore(db: LibSQLDatabase): Reloadable<DisplayFolder[]> {
  return asyncDerived(
    [],
    async () => {
      const dbFolders = await queryFolders(db)
      const folders = dbFolders.map(dbFolderToDisplayFolder)
      return folders
    },
    {
      reloadable: true,
      initial: [],
    }
  ) as Reloadable<DisplayFolder[]>
}

export async function createRemoteFoldersStore(
  db: LibSQLDatabase | null,
  migrationState: MigrationState,
): Promise<RemoteFoldersStore> {
  let store: Reloadable<DisplayFolder[]>
  if (db === null) {
    store = asyncDerived(
      [],
      async () => {
        return []
      },
      {
        reloadable: true,
      }
    ) as Reloadable<DisplayFolder[]>
  } else {
    // @ts-ignore
    store = createFoldersStore(db)
  }
  await store.load()

  async function isAvailable() {
    return db !== null && migrationState === 'done'
  }

  async function refresh() {
    await store.reload()
  }

  return {
    subscribe: store.subscribe,
    async upsert(folder: DisplayFolder) {
      if (!await isAvailable()) {
        return
      }

      await upsertFolder(db!, displayFolderToDbFolder(folder))
      await store.reload()
    },
    async delete(id: string) {
      if (!await isAvailable()) {
        return
      }

      await deleteFolder(db!, id)
      await store.reload()
    },
    isAvailable,
    refresh,
  }
}

// export async function createRemoteFoldersStoreV2(
//   dbPairStore: Readable<DbPair>,
//   migrationStateStore: Readable<MigrationState>,
// ): Promise<RemoteFoldersStore> {
//   let store: RemoteFoldersStore = {
//     subscribe() {return () => {}},
//     upsert: async () => {},
//     delete: async () => {},
//     isAvailable: async () => false,
//     refresh: async () => {},
//   }
//   const dbStore = derived(
//     [dbPairStore, migrationStateStore],
//     ([dbPair, migrationState]) => dbPair[1]
//   )
//   dbStore.subscribe(
//     db => {
//       store = createRemoteFoldersStore(db, get(migrationStateStore))
//     }
//   )
//
//   return {
//     ...store
//   }
// }
