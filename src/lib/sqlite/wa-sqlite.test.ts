import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import {
  createLocalDb,
  createLocalSnippetsStore,
  createQueryExecutor,
  createSQLiteAPIV2,
  migrateLocal
} from './wa-sqlite'
import { createWASqliteMockWASMHandler } from '$lib/utitlities/testing'
import { defaultMigrationQueryMap, defaultQueriesStringMap, } from './migration'
import { sql } from 'drizzle-orm'
import { get, writable } from 'svelte/store'
import type { GlobalState } from '$lib/utitlities/persistence'
import { createNewSnippet } from '$lib/utitlities/persistence'
import { waitUntil } from '$lib/utitlities/wait-until'

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

  it('migrate local', async () => {
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta', false)

    await migrateLocal(
      executor,
      async () => {},
      defaultMigrationQueryMap,
      defaultQueriesStringMap,
    )

    {
      const result = await executor.execute('PRAGMA user_version')
      expect(result).toEqual([[1]])
    }
    {
      const result = await executor.execute('SELECT id, name, position FROM folders')
      expect(result).toEqual([['default', 'Default', 0]])
    }
  })
})

describe('local snippets store', async () => {
  it('migrate', async () => {
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const dummyGlobalStateStore = writable<GlobalState>({folderId: 'default', tags: [], searchInput: ''})
    const localStore = await createLocalSnippetsStore(
      executor,
      dummyGlobalStateStore,
    )

    {
      // We need this since `localStore` is going to overlap its calls with
      // `executor`, which leads to a race condition.
      await new Promise((resolve) => setTimeout(resolve, 100))
      const result = await executor.execute('PRAGMA user_version')
      expect(result).toEqual([[1]])
    }
  })

  it('crud', async () => {
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const localDb = createLocalDb(executor)
    const dummyGlobalStateStore = writable<GlobalState>({folderId: 'default', tags: [], searchInput: ''})
    const localStore = await createLocalSnippetsStore(
      executor,
      dummyGlobalStateStore,
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
    const dummyGlobalStateStore = writable<GlobalState>({folderId: 'default', tags: [], searchInput: ''})
    const localStore = await createLocalSnippetsStore(
      executor,
      dummyGlobalStateStore,
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

  it('tags', async () => {
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const localDb = createLocalDb(executor)
    const dummyGlobalStateStore = writable<GlobalState>({folderId: 'default', tags: [], searchInput: ''})
    const localStore = await createLocalSnippetsStore(
      executor,
      dummyGlobalStateStore,
    )
    await waitUntil(async () => get(localStore.migrationStateStore) === 'done')

    const newSnippet = createNewSnippet()
    newSnippet.tags = ['one', 'two', 'three']

    await localStore.upsert(newSnippet)
    {
      const result = await localDb.all(sql`SELECT tag_text FROM snippet_tags WHERE snippet_id = ${newSnippet.id}`) as [[string]]
      const tag_texts = result.map((row) => row[0])
      tag_texts.sort()
      expect(tag_texts).toEqual(['one', 'three', 'two'])
    }

    newSnippet.tags = ['one']

    await localStore.upsert(newSnippet)
    {
      const result = await localDb.all(sql`SELECT tag_text FROM snippet_tags WHERE snippet_id = ${newSnippet.id}`) as [[string]]
      const tag_texts = result.map((row) => row[0])
      expect(tag_texts).toEqual(['one'])
    }
  })
})
