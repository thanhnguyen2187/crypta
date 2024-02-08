import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { createLocalDb, createQueryExecutor, createSQLiteAPIV2 } from './wa-sqlite'
import { createWASqliteMockWASMHandler } from '$lib/utitlities/tests-setup'
import { defaultMigrationQueryMap, defaultQueriesStringMap, migrate, } from './migration'
import type { MigrationState } from './migration'
import { sql } from 'drizzle-orm'
import { get, writable } from 'svelte/store'
import type { GlobalState } from '$lib/utitlities/persistence'
import { createLocalSnippetStoreV2, createNewSnippet } from '$lib/utitlities/persistence'

const handlers = createWASqliteMockWASMHandler()
const server = setupServer(...handlers)
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterAll(() => {
  server.close()
})

describe('executor', async () => {
  it('basic query', async () => {
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryAsyncVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    {
      const result = await executor.execute('SELECT 1')
      expect(result).toEqual([[1]])
    }
    {
      const result = await executor.execute('PRAGMA user_version')
      expect(result).toEqual([[0]])
    }
  })

  it('local db', async () => {
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryAsyncVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const localDb = createLocalDb(executor)
    {
      const result = await localDb.run(sql`SELECT 1`)
      expect(result).toEqual({rows: [[1]]})
    }
    {
      const result = await localDb.run(sql`PRAGMA user_version`)
      expect(result).toEqual({rows: [[0]]})
    }
  })

  it('migrate', async () => {
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const localDb = createLocalDb(executor)
    const dummyMigrationStateStore = writable<MigrationState>('not-started')

    await migrate(
      localDb,
      dummyMigrationStateStore,
      async () => {},
      defaultMigrationQueryMap,
      defaultQueriesStringMap,
    )
    expect(get(dummyMigrationStateStore)).toBe('done')
    {
      const result = await localDb.run(sql`PRAGMA user_version`)
      expect(result).toEqual({rows: [[1]]})
    }
    {
      const result = await localDb.run(sql`SELECT id, name, position FROM folders`)
      expect(result).toEqual({rows: [['default', 'Default', 0]]})
    }
  })
})

describe('local snippets store', async () => {
  it('crud', async () => {
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const localDb = createLocalDb(executor)
    const dummyMigrationStateStore = writable<MigrationState>('not-started')
    const dummyGlobalStateStore = writable<GlobalState>({folderId: 'default', tags: [], searchInput: ''})
    await migrate(
      localDb,
      dummyMigrationStateStore,
      async () => {},
      defaultMigrationQueryMap,
      defaultQueriesStringMap,
    )
    const localStore = await createLocalSnippetStoreV2(
      dummyMigrationStateStore,
      dummyGlobalStateStore,
      localDb,
    )
    const newSnippet = createNewSnippet()

    await localStore.upsert(newSnippet)
    {
      const result = await localDb.get(sql`SELECT COUNT(*) FROM snippets`)
      expect(result).toEqual([1])
    }
    {
      const result = await localDb.get(sql`SELECT id FROM snippets`)
      expect(result).toEqual([newSnippet.id])
    }

    newSnippet.name = 'changed name'
    await localStore.upsert(newSnippet)
    {
      const result = await localDb.get(sql`SELECT name FROM snippets`)
      expect(result).toEqual(['changed name'])
    }

    await localStore.remove(newSnippet.id)
    {
      const result = await localDb.get(sql`SELECT COUNT(*) FROM snippets`)
      expect(result).toEqual([0])
    }
    {
      const result = await localDb.get(sql`SELECT id FROM snippets`)
      expect(result).toEqual([])
    }
  })

  it('special crud', async () => {
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const localDb = createLocalDb(executor)
    const dummyMigrationStateStore = writable<MigrationState>('not-started')
    const dummyGlobalStateStore = writable<GlobalState>({folderId: 'default', tags: [], searchInput: ''})
    await migrate(
      localDb,
      dummyMigrationStateStore,
      async () => {},
      defaultMigrationQueryMap,
      defaultQueriesStringMap,
    )
    const localStore = await createLocalSnippetStoreV2(
      dummyMigrationStateStore,
      dummyGlobalStateStore,
      localDb,
    )
    const newSnippet = createNewSnippet()
    await localStore.upsert(newSnippet)

    await localStore.clone(newSnippet)
    {
      const result = await localDb.get(sql`SELECT COUNT(*) FROM snippets`)
      expect(result).toEqual([2])
    }

    // IMPORTANT: Sqlite originally does not enforce foreign key. `wa-sqlite`
    // follows that. Therefore, even though there is no such folder with ID
    // `new-folder`, the operation stills work without error. We can enforce
    // foreign key constraint using `PRAGMA foreign_keys = ON`.
    await localStore.move(newSnippet, 'default', 'new-folder')
    {
      const result = await localDb.get(
        sql`SELECT folder_id FROM snippets WHERE id = ${newSnippet.id}`,
      )
      expect(result).toEqual(['new-folder'])
    }
  })
})