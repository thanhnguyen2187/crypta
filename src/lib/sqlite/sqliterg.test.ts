import { describe, it, expect, expectTypeOf, assertType } from 'vitest'
import { createRemoteDb, createRemoteSnippetStore, createSqlitergExecutor } from './sqliterg'
import type { ResponseExecuteError } from './sqliterg'
import { migrate, defaultMigrationQueryMap, defaultQueriesStringMap } from './migration'
import type { MigrationState } from './migration'
import { sql } from 'drizzle-orm'
import { derived, get, writable } from 'svelte/store'
import { folders } from '$lib/sqlite/schema'
import type { Settings } from '$lib/utitlities/ephemera'
import type { GlobalState } from '$lib/utitlities/persistence';
import { createNewSnippet } from '$lib/utitlities/persistence'

const TestServerURL = 'http://127.0.0.1:12322/crypta'
const TestServerURLWrong = 'http://127.0.0.1:12323/crypta'
const TestServerUsername = 'crypta'
const TestServerPassword = 'crypta'

// IMPORTANT: `yarn dev-db` should be run before the tests are executed
describe('executor', () => {
  it('unreachable', async () => {
    const executor = createSqlitergExecutor(
      TestServerURLWrong,
      '',
      '',
    )
    expect(await executor.isReachable()).toBe(false)
  })
  it('reachable but unauthorized', async () => {
    const executor = createSqlitergExecutor(
      'http://127.0.0.1:12321/crypta',
      '',
      '',
    )
    expect(await executor.isReachable()).toBe(true)
    expect(await executor.isAuthenticated()).toBe(false)
  })
  it('reachable and authorized', async () => {
    const executor = createSqlitergExecutor(
      'http://127.0.0.1:12321/crypta',
      'crypta',
      'crypta',
    )
    expect(await executor.isReachable()).toBe(true)
    expect(await executor.isAuthenticated()).toBe(true)
  })
  it('basic query', async () => {
    const executor = createSqlitergExecutor(
      'http://127.0.0.1:12321/crypta',
      'crypta',
      'crypta',
    )
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
    const executor = createSqlitergExecutor(
      'http://127.0.0.1:12321/crypta',
      'crypta',
      'crypta',
    )
    const remoteDb = createRemoteDb(executor)
    {
      const result = await remoteDb.get(sql`SELECT 1`)
      expect(result).toEqual([1])
    }
  })
  it('migration', async () => {
    const executor = createSqlitergExecutor(
      'http://127.0.0.1:12321/crypta',
      'crypta',
      'crypta',
    )
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
  const dummyStateStore = writable<MigrationState>('done')
  const dummySettingsStore = writable<Settings>({
    serverURL: 'http://127.0.0.1:12322/crypta',
    username: '',
    password: '',
  })
  const dummyGlobalStore = writable<GlobalState>({
    folderId: 'default',
    tags: [],
    searchInput: '',
  })
  const dummyExecutorStore = derived(
    dummySettingsStore,
    (settings) => createSqlitergExecutor(
      settings.serverURL,
      settings.username,
      settings.password,
    )
  )
  const remoteSnippetStore = await createRemoteSnippetStore(
    dummyStateStore,
    dummyGlobalStore,
    dummyExecutorStore,
  )

  it('availability', async () => {
    // unreachable server
    dummySettingsStore.set({
      serverURL: 'http://127.0.0.1:12322/crypta',
      username: '',
      password: '',
    })
    {
      const availability = await remoteSnippetStore.isAvailable()
      expect(availability).toBe(false)
    }

    // reachable server with wrong authentication
    dummySettingsStore.set({
      serverURL: 'http://127.0.0.1:12321/crypta',
      username: 'crypta',
      password: 'wrong password',
    })
    {
      const availability = await remoteSnippetStore.isAvailable()
      expect(availability).toBe(false)
    }

    // available server
    dummySettingsStore.set({
      serverURL: 'http://127.0.0.1:12321/crypta',
      username: 'crypta',
      password: 'crypta',
    })
    {
      const availability = await remoteSnippetStore.isAvailable()
      expect(availability).toBe(true)
    }
  })
  it('crud', async () => {
    dummySettingsStore.set({
      serverURL: 'http://127.0.0.1:12321/crypta',
      username: 'crypta',
      password: 'crypta',
    })

    const availability = await remoteSnippetStore.isAvailable()
    expect(availability).toBe(true)

    await remoteSnippetStore.refresh()

    let snippets = get(remoteSnippetStore)
    const newSnippet = createNewSnippet()
    await remoteSnippetStore.upsert(newSnippet)

    snippets = get(remoteSnippetStore)
    expect(snippets.length).toBeGreaterThan(0)
    expect(snippets).toContainEqual(newSnippet)

    for(const snippet of snippets) {
      await remoteSnippetStore.remove(snippet.id)
    }
    expect(snippets.length).toBe(0)
  })
})
