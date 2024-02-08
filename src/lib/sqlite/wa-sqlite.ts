import AsyncSQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite-async.mjs'
import SyncSQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import * as SQLite from 'wa-sqlite'
// @ts-ignore
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
import { MemoryAsyncVFS } from 'wa-sqlite/src/examples/MemoryAsyncVFS.js'
import { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'
// @ts-ignore
import { OriginPrivateFileSystemVFS } from 'wa-sqlite/src/examples/OriginPrivateFileSystemVFS.js'
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import type { MigrationQueryMap, QueriesStringMap } from '$lib/sqlite/migration'
import type { MigrationState } from '$lib/sqlite/migration'
import { derived, writable } from 'svelte/store'
import type { Invalidator, Subscriber, Unsubscriber, Writable } from 'svelte/store'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import {
  clearTags,
  deleteSnippet as deleteSnippet_,
  querySnippetsByFolderId,
  queryTagsBySnippetIds,
  upsertSnippet,
  upsertTags
} from '$lib/sqlite/queries';
import {
  buildTagsMap,
  dbSnippetToDisplaySnippet,
  displaySnippetToDbSnippet
} from '$lib/utitlities/data-transformation';
import type { GlobalState, Snippet, SnippetStore } from '$lib/utitlities/persistence';

export type WASqliteExecutor = {
  execute(query: string, ...params: SQLiteCompatibleType[]): Promise<SQLiteCompatibleType[][]>
  close(): Promise<void>
}

export async function createSQLiteAPIV2(
  wasmBaseURL: string = '.',
  vfs_type:
    | 'IDBBatchAtomicVFS'
    | 'OriginPrivateFileSystemVFS'
    | 'MemoryAsyncVFS'
    | 'MemoryVFS'
    = 'IDBBatchAtomicVFS',
): Promise<SQLiteAPI> {
  const config = {
    // We set this configuration to load WASM files from the correct path.
    //
    // Also see explanation from `wa-sqlite`'s author:
    // https://github.com/rhashimoto/wa-sqlite/issues/15
    locateFile(file: string) {
      return `${wasmBaseURL}/${file}`
    }
  }
  // IMPORTANT: VFS should be registered with the correct sync/async factory.
  //
  // See related information in this issue:
  // https://github.com/rhashimoto/wa-sqlite/issues/137
  let vfs
  let module
  switch (vfs_type) {
    case 'IDBBatchAtomicVFS':
      module = await AsyncSQLiteESMFactory(config)
      vfs = new IDBBatchAtomicVFS()
      break
    case 'MemoryAsyncVFS':
      module = await AsyncSQLiteESMFactory(config)
      vfs = new MemoryAsyncVFS()
      break
    case 'MemoryVFS':
      module = await SyncSQLiteESMFactory(config)
      vfs = new MemoryVFS()
      break
    case 'OriginPrivateFileSystemVFS':
      module = await AsyncSQLiteESMFactory(config)
      vfs = new OriginPrivateFileSystemVFS()
      break
    default:
      throw new Error(`createSQLiteAPIV2: unsupported vfs_type: ${vfs_type}`)
  }
  const sqlite3 = SQLite.Factory(module)
  sqlite3.vfs_register(vfs, true)
  return sqlite3
}

export async function createQueryExecutor(
  sqlite3: SQLiteAPI,
  databaseName: string,
  locking: boolean = true,
): Promise<WASqliteExecutor> {
  const db = await sqlite3.open_v2(databaseName)
  async function executeFn(query: string, ...params: SQLiteCompatibleType[]): Promise<SQLiteCompatibleType[][]> {
    const rows = []
    for await (const stmt of sqlite3.statements(db, query)) {
      params.forEach((param, index) => sqlite3.bind(stmt, index + 1, param))
      while (await sqlite3.step(stmt) === SQLite.SQLITE_ROW) {
        rows.push(sqlite3.row(stmt))
      }
    }
    return rows
  }
  async function close() {
    await sqlite3.close(db)
  }
  async function executeLocking(query: string, ...params: SQLiteCompatibleType[]) {
    return await navigator.locks.request('crypta_executor', (lock) => executeFn(query, ...params))
  }
  async function executeWithoutLocking(query: string, ...params: SQLiteCompatibleType[]) {
    return await executeFn(query, ...params)
  }

  if (locking) {
    return {
      execute: executeLocking,
      close,
    }
  } else {
    return {
      execute: executeWithoutLocking,
      close,
    }
  }
}

export function createLocalDb(executor: WASqliteExecutor) {
  return drizzle(async (queryString, params, method) => {
    const result = await executor.execute(queryString, ...params)
    if (method === 'get' && result.length > 0) {
      return {rows: result[0]}
    }
    return {rows: result}
  })
}

export async function migrateLocal(
  executor: WASqliteExecutor,
  dataImportFn: (executor: WASqliteExecutor) => Promise<void>,
  migrationQueryMap: MigrationQueryMap,
  queriesStringMap: QueriesStringMap,
) {
  let [[currentUserVersion]] = await executor.execute('PRAGMA user_version') as [[number]]
  while (migrationQueryMap[currentUserVersion]) {
    const migrationQueryPath = migrationQueryMap[currentUserVersion]
    const migrationQueryString = queriesStringMap[migrationQueryPath]
    if (!migrationQueryString) {
      throw new Error(`migrate: could not find query string of ${migrationQueryPath}`)
    }
    await executor.execute(migrationQueryString)
    if (currentUserVersion === 0) {
      await dataImportFn(executor)
      const path = '/db/0000_seed_default_folder.sql'
      const seedFolderQuery = queriesStringMap[path]
      await executor.execute(seedFolderQuery)
    }
    currentUserVersion += 1
    await executor.execute(`PRAGMA user_version = ${currentUserVersion}`)
  }
}

export async function createLocalSnippetStoreV2(
  migrationStateStore: Writable<MigrationState>,
  globalStateStore: Writable<GlobalState>,
  db: SqliteRemoteDatabase,
): Promise<SnippetStore> {
  let snippets: Snippet[] = []
  let folderId = 'default'
  const store = writable(snippets)
  const stores = derived(
    [globalStateStore, migrationStateStore],
    ([globalState, migrationState]: [GlobalState, MigrationState]) => {
      folderId = globalState.folderId
      return [globalState, migrationState]
    }
  )
  const pairUnsubscribeFn = stores.subscribe(
    // TODO: fix the typing of `globalState` and `migrationState`, which both
    //       have the type `GlobalState | MigrationState`
    async ([globalState, migrationState]) => {
      if (migrationState === 'done') {
        const dbSnippets = await querySnippetsByFolderId(db, (globalState as GlobalState).folderId)
        const snippetIds = dbSnippets.map(snippet => snippet.id)
        const tags = await queryTagsBySnippetIds(db, snippetIds)
        const tagsMap = buildTagsMap(tags)
        snippets = dbSnippets.map(
          (dbSnippet) => dbSnippetToDisplaySnippet(dbSnippet, tagsMap)
        )
        store.set(snippets)
      }
    }
  )

  return {
    subscribe(
      run: Subscriber<Snippet[]>,
      invalidate?: Invalidator<Snippet[]>,
    ): Unsubscriber {
      const baseUnsubscribeFn = store.subscribe(run, invalidate)

      return () => {
        pairUnsubscribeFn()
        baseUnsubscribeFn()
      }
    },
    clone: async (snippet: Snippet) => {
      const clonedSnippet: Snippet = {
        ...snippet,
        id: crypto.randomUUID(),
        position: snippets.length + 1,
        tags: snippet.tags.slice(),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }
      const dbSnippet = displaySnippetToDbSnippet(folderId, clonedSnippet)
      await upsertSnippet(db, dbSnippet)
      if (snippet.tags.length > 0) {
        await upsertTags(db, clonedSnippet.id, snippet.tags)
      }
      snippets.push(clonedSnippet)

      store.set(snippets)
    },
    upsert: async (snippet: Snippet) => {
      const dbSnippet = displaySnippetToDbSnippet(folderId, snippet)
      await upsertSnippet(db, dbSnippet)
      if (snippet.tags && snippet.tags.length > 0) {
        await clearTags(db, snippet.id)
        await upsertTags(db, snippet.id, snippet.tags)
      }
      const index = snippets.findIndex(snippet_ => snippet_.id === snippet.id)
      if (index === -1) {
        snippets.push(snippet)
        store.set(snippets)
        return
      }

      snippets[index] = snippet
      store.set(snippets)
    },
    remove: async (id: string) => {
      await deleteSnippet_(db, id)
      const index = snippets.findIndex(snippet => snippet.id === id)
      snippets.splice(index, 1)

      store.set(snippets)
    },
    move: async (movingSnippet: Snippet, sourceFolderId: string, destinationFolderId: string) => {
      const dbSnippet = displaySnippetToDbSnippet(sourceFolderId, movingSnippet)
      dbSnippet.folderId = destinationFolderId
      await upsertSnippet(db, dbSnippet)

      const index = snippets.findIndex(snippet => snippet.id === movingSnippet.id)
      snippets.splice(index, 1)

      store.set(snippets)
    },
  }
}
