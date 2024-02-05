import { describe, it, expect, expectTypeOf } from 'vitest'
import { createRemoteDb, createRemoteSnippetStore, createSqlitergExecutor } from './sqliterg'
import type { SqlitergExecutor, ResponseExecuteError } from './sqliterg'
import { migrate, defaultMigrationQueryMap, defaultQueriesStringMap } from './migration'
import type { MigrationState } from './migration'
import { sql } from 'drizzle-orm'
import { get, writable } from 'svelte/store'
import { folders } from '$lib/sqlite/schema'
import type { GlobalState } from '$lib/utitlities/persistence';
import { createNewSnippet } from '$lib/utitlities/persistence'

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

function createAvailableExecutor(): SqlitergExecutor {
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
        return
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

describe('remote snippet store', async () => {
  it('availability', async () => {
    const dummyStateStore = writable<MigrationState>('done')
    const dummyGlobalStore = writable<GlobalState>({
      folderId: 'default',
      tags: [],
      searchInput: '',
    })
    const dummyExecutorStore = writable<SqlitergExecutor>(createAvailableExecutor())
    const remoteSnippetStore = await createRemoteSnippetStore(
      dummyStateStore,
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

    // available server
    {
      dummyExecutorStore.set(createAvailableExecutor())
      const availability = await remoteSnippetStore.isAvailable()
      expect(availability).toBe(true)
    }
  })
  it('crud', async () => {
    const dummyStateStore = writable<MigrationState>('done')
    const dummyGlobalStore = writable<GlobalState>({
      folderId: 'default',
      tags: [],
      searchInput: '',
    })
    const dummyExecutorStore = writable<SqlitergExecutor>(createAvailableExecutor())
    const remoteSnippetStore = await createRemoteSnippetStore(
      dummyStateStore,
      dummyGlobalStore,
      dummyExecutorStore,
    )

    const availability = await remoteSnippetStore.isAvailable()
    expect(availability).toBe(true)

    await remoteSnippetStore.clear()
    await remoteSnippetStore.refresh()

    const newSnippet = createNewSnippet()
    await remoteSnippetStore.upsert(newSnippet)

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
})
