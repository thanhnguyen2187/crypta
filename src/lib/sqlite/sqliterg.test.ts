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
import {
  deleteAllSnippets,
  deleteFolder,
  querySnippetsByFolderId,
  upsertFolder,
  upsertSnippet
} from '$lib/sqlite/queries';
import { createDummySnippet } from '$lib/utitlities/testing'
import { displaySnippetToDbSnippet } from '$lib/utitlities/data-transformation'

enum Constants {
  ServerURL = 'http://127.0.0.1:12321/crypta',
  ServerURLWrong = 'http://127.0.0.1:12322/crypta',
  Blank = '',
  Username = 'crypta',
  Password = 'crypta',
  PasswordWrong = 'wrong'
}

export function createEmptyExecutor(): SqlitergExecutor {
  return createSqlitergExecutor(
    Constants.Blank,
    Constants.Blank,
    Constants.Blank,
  )
}

export function createUnreachableExecutor(): SqlitergExecutor {
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

  it('select columns order', async () => {
    // IMPORTANT: this test uses a "patched" version of `ws4sqlite` that
    // ensures returned object keys' order (`thanhnguyen2187/ws4sqlite`).
    //
    // Look at https://github.com/proofrock/ws4sqlite/pull/38 for more
    // information.
    const executor = createAvailableExecutor()

    await executor.execute('DELETE FROM snippets', {})
    const date = new Date()
    const createdAt = date.toISOString()
    const updatedAt = date.toISOString()
    const snippet = createDummySnippet('dummy-id', date.getTime(), date.getTime())
    await executor.execute(
      'INSERT INTO snippets VALUES (:id, :folder_id, :name, :language, :text, :encrypted, :position, :created_at, :updated_at)',
      {
        id: snippet.id,
        folder_id: 'default',
        name: snippet.name,
        language: snippet.language,
        text: snippet.text,
        encrypted: snippet.encrypted,
        position: snippet.position,
        created_at: createdAt,
        updated_at: updatedAt,
      },
    )

    {
      const result = await executor.execute(`SELECT * FROM snippets`, {})
      if (!('results' in result)) {
        throw Error('select column order: unreachable code')
      }
      if (!('resultSet' in result.results[0])) {
        throw Error('select column order: unreachable code')
      }
      const record = result.results[0].resultSet[0]
      expect(Object.values(record)).toEqual([
        'dummy-id', // id
        'default', // folder_id
        'dummy name', // name
        'dummy language', // language
        'dummy text', // text
        0, // encrypted
        1, // position
        createdAt, // created_at
        updatedAt, // updated_at
      ])
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
    const executor = createAvailableExecutor()
    const dummyExecutorStore = writable<SqlitergExecutor>(executor)
    const remoteSnippetStore = await createRemoteSnippetStore(
      dummyGlobalStore,
      dummyExecutorStore,
    )
    await waitUntil(remoteSnippetStore.isAvailable)
    await remoteSnippetStore.clearAll()

    const newSnippet = createDummySnippet('dummy-id', 0, 0)
    await remoteSnippetStore.upsert(newSnippet)

    {
      const response = await executor.execute('SELECT * FROM snippets', {})
      if (!('results' in response)) {
        throw Error('crud: unreachable code')
      }
      if (!('resultSet' in response.results[0])) {
        throw Error('crud: unreachable code')
      }
      const record = response.results[0].resultSet[0]
      expect(Object.values(record)).toEqual([
        'dummy-id', // id
        'default', // folder_id
        'dummy name', // name
        'dummy language', // language
        'dummy text', // text
        0, // encrypted
        1, // position
        expect.anything(), // created_at
        expect.anything(), // updated_at
      ])
    }

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
