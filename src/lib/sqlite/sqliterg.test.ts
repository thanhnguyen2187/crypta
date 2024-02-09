import { describe, it, expect, expectTypeOf } from 'vitest'
import { createRemoteDb, createRemoteSnippetStore, createSqlitergExecutor, migrateRemote } from './sqliterg'
import type { SqlitergExecutor, ResponseExecuteError } from './sqliterg'
import { migrate, defaultMigrationQueryMap, defaultQueriesStringMap } from './migration'
import type { MigrationState } from './migration'
import { sql } from 'drizzle-orm'
import { get, writable } from 'svelte/store'
import { snippets as snippets_, folders } from '$lib/sqlite/schema'
import type { Folder, GlobalState } from '$lib/utitlities/persistence';
import { createNewSnippet } from '$lib/utitlities/persistence'
import { waitUntil } from '$lib/utitlities/wait-until';
import type { DisplayFolder } from '$lib/components/sidebar-folder/store';
import { deleteFolder, upsertFolder } from '$lib/sqlite/queries';

enum Constants {
  ServerURL = 'http://127.0.0.1:12321/crypta',
  ServerURLWrong = 'http://127.0.0.1:12322/crypta',
  Blank = '',
  Username = 'crypta',
  Password = 'crypta',
  PasswordWrong = 'wrong'
}

function createUnreachableExecutor(): SqlitergExecutor {
  return createSqlitergExecutor(
    Constants.ServerURLWrong,
    Constants.Blank,
    Constants.Blank,
  )
}

function createUnauthenticatedExecutor(): SqlitergExecutor {
  return createSqlitergExecutor(
    Constants.ServerURL,
    Constants.Username,
    Constants.PasswordWrong,
  )
}

export function createAvailableExecutor(): SqlitergExecutor {
  return createSqlitergExecutor(
    Constants.ServerURL,
    Constants.Username,
    Constants.Password,
  )
}

// IMPORTANT: `yarn dev-db` should be run before the tests are executed
describe('executor', () => {
  it('unreachable', async () => {
    const executor = createUnreachableExecutor()
    expect(await executor.isReachable()).toBe(false)
  })
  it('reachable but unauthenticated', async () => {
    const executor = createUnauthenticatedExecutor()
    expect(await executor.isReachable()).toBe(true)
    expect(await executor.isAuthenticated()).toBe(false)
  })
  it('reachable and authenticated', async () => {
    const executor = createAvailableExecutor()
    expect(await executor.isReachable()).toBe(true)
    expect(await executor.isAuthenticated()).toBe(true)
  })
  it('basic query', async () => {
    const executor = createAvailableExecutor()
    {
      const result = await executor.execute('SELECT 1', [])
      expectTypeOf(result).not.toEqualTypeOf<ResponseExecuteError>()
      if (!('results' in result)) {
        throw Error('test executor basic query: unreachable code')
      }
      expect(result.results[0]).toEqual({
        resultSet: [
          {
            "1": 1,
          },
        ],
        success: true,
      })
    }
  })
  it('migrate remote', async () => {
    const executor = createAvailableExecutor()
    await migrateRemote(executor, defaultMigrationQueryMap, defaultQueriesStringMap)
    {
      const result = await executor.execute('PRAGMA user_version', [])
      if (!('results' in result)) {
        throw Error('test executor basic query: unreachable code')
      }
      expect(result.results[0]).toEqual({
        resultSet: [
          {
            "user_version": 1,
          },
        ],
        success: true,
      })
    }
    {
      const result = await executor.execute('SELECT id, name, position FROM folders', [])
      if (!('results' in result)) {
        throw Error('test executor basic query: unreachable code')
      }
      expect(result.results[0]).toEqual({
        resultSet: [
          {
            id: 'default',
            name: 'Default',
            position: 0,
          },
        ],
        success: true,
      })
    }
  })
})

describe('remote database', () => {
  it('basic query', async () => {
    const executor = createAvailableExecutor()
    const remoteDb = createRemoteDb(executor)
    {
      const result = await remoteDb.get(sql`SELECT 1`)
      expect(result).toEqual([1])
    }
  })
  it('migration', async () => {
    const executor = createAvailableExecutor()
    const remoteDb = createRemoteDb(executor)
    const dummyStateStore = writable<MigrationState>('not-started')
    const dummyDataImportFn = async () => {}

    await migrate(
      remoteDb,
      dummyStateStore,
      dummyDataImportFn,
      defaultMigrationQueryMap,
      defaultQueriesStringMap,
    )

    {
      const result = await remoteDb.get(sql`PRAGMA user_version`)
      expect(result).toEqual([1])
    }
    {
      const result = await remoteDb.get(sql`SELECT id, name, position FROM folders`)
      expect(result).toEqual(["default", "Default", 0])
    }
    {
      const result = await remoteDb.select({
        id: folders.id,
        name: folders.name,
        position: folders.position,
      }).from(folders).where(sql`id = ${'default'}`)
      expect(result.length).toBeGreaterThan(0)
      const record = result[0]
      expect(record).toContain({
        id: 'default',
        name: 'Default',
        position: 0,
      })
    }
  })
})

describe('remote snippets store', async () => {
  it('availability', async () => {
    const dummyGlobalStore = writable<GlobalState>({
      folderId: 'default',
      tags: [],
      searchInput: '',
    })
    const dummyExecutorStore = writable<SqlitergExecutor>(createUnreachableExecutor())
    const remoteSnippetStore = await createRemoteSnippetStore(
      dummyGlobalStore,
      dummyExecutorStore,
    )

    // unreachable server
    {
      dummyExecutorStore.set(createUnreachableExecutor())
      const availability = await remoteSnippetStore.isAvailable()
      expect(availability).toBe(false)
    }

    // reachable server with wrong authentication
    {
      dummyExecutorStore.set(createUnauthenticatedExecutor())
      const availability = await remoteSnippetStore.isAvailable()
      expect(availability).toBe(false)
    }

    // available server & migration
    {
      dummyExecutorStore.set(createUnreachableExecutor())
      const migrationStateStore = remoteSnippetStore.migrationStateStore
      expect(get(migrationStateStore)).toBe('not-started')
      dummyExecutorStore.set(createAvailableExecutor())
      await waitUntil(remoteSnippetStore.isAvailable)
      expect(get(migrationStateStore)).toBe('done')
    }
  })
  it('crud', async () => {
    const dummyGlobalStore = writable<GlobalState>({
      folderId: 'default',
      tags: [],
      searchInput: '',
    })
    const dummyExecutorStore = writable<SqlitergExecutor>(createAvailableExecutor())
    const remoteSnippetStore = await createRemoteSnippetStore(
      dummyGlobalStore,
      dummyExecutorStore,
    )
    await waitUntil(remoteSnippetStore.isAvailable)
    await remoteSnippetStore.clearAll()

    const newSnippet = createNewSnippet()
    await remoteSnippetStore.upsert(newSnippet)

    // TODO: check more thoroughly by comparing with result from database
    let snippets = get(remoteSnippetStore)
    expect(snippets.length).toBe(1)
    expect(snippets).toContainEqual(newSnippet)

    newSnippet.name = 'changed name'
    await remoteSnippetStore.upsert(newSnippet)
    snippets = get(remoteSnippetStore)
    expect(snippets.length).toBe(1)
    expect(snippets[0].name).toBe('changed name')

    await remoteSnippetStore.remove(newSnippet.id)
    snippets = get(remoteSnippetStore)
    expect(snippets.length).toBe(0)
  })

  it('special crud', async () => {
    const dummyGlobalStore = writable<GlobalState>({
      folderId: 'default',
      tags: [],
      searchInput: '',
    })
    const executor = createAvailableExecutor()
    const dummyExecutorStore = writable<SqlitergExecutor>(executor)
    const dummyRemoteDb = createRemoteDb(executor)
    const remoteSnippetStore = await createRemoteSnippetStore(
      dummyGlobalStore,
      dummyExecutorStore,
    )
    await waitUntil(remoteSnippetStore.isAvailable)
    await remoteSnippetStore.clearAll()

    const newSnippet = createNewSnippet()
    await remoteSnippetStore.upsert(newSnippet)
    await remoteSnippetStore.clone(newSnippet)

    const snippets = get(remoteSnippetStore)
    expect(snippets.length).toBe(2)
    expect(snippets[0].id).toEqual(newSnippet.id)
    expect(snippets[1].id).not.toEqual(newSnippet.id)

    await upsertFolder(dummyRemoteDb, {id: 'dummy', name: 'Dummy', position: 1})
    await remoteSnippetStore.move(newSnippet, 'default', 'dummy')
    const dbFolderId = await dummyRemoteDb.get(sql`SELECT folder_id FROM snippets WHERE id = ${newSnippet.id}`)
    expect(dbFolderId).toEqual(['dummy'])

    await remoteSnippetStore.clearAll()
    await deleteFolder(dummyRemoteDb, 'dummy')
  })

  it('tags', async () => {
    const dummyGlobalStore = writable<GlobalState>({
      folderId: 'default',
      tags: [],
      searchInput: '',
    })
    const executor = createAvailableExecutor()
    const dummyExecutorStore = writable<SqlitergExecutor>(executor)
    const dummyRemoteDb = createRemoteDb(executor)
    const remoteSnippetStore = await createRemoteSnippetStore(
      dummyGlobalStore,
      dummyExecutorStore,
    )
    await waitUntil(remoteSnippetStore.isAvailable)
    await remoteSnippetStore.clearAll()
    await remoteSnippetStore.clearAllTags()

    const newSnippet = createNewSnippet()
    newSnippet.tags = ['one', 'two', 'three']

    await remoteSnippetStore.upsert(newSnippet)
    {
      const result = await dummyRemoteDb.all(sql`SELECT tag_text FROM snippet_tags WHERE snippet_id = ${newSnippet.id}`) as [[string]]
      const tag_texts = result.map((row) => row[0])
      tag_texts.sort()
      expect(tag_texts).toEqual(['one', 'three', 'two'])
    }

    newSnippet.tags = ['one']

    await remoteSnippetStore.upsert(newSnippet)
    {
      const result = await dummyRemoteDb.all(sql`SELECT tag_text FROM snippet_tags WHERE snippet_id = ${newSnippet.id}`) as [[string]]
      const tag_texts = result.map((row) => row[0])
      expect(tag_texts).toEqual(['one'])
    }
  })
})
