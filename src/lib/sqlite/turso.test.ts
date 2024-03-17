import { beforeAll, describe, expect, it } from 'vitest'
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { sql } from 'drizzle-orm'
import {
  createDb,
  createRemoteFoldersStore,
  createRemoteSnippetsStore,
  createSnippetsStore,
  migrateRemote
} from './turso'
import { defaultMigrationQueryMap, defaultQueriesStringMap } from '$lib/sqlite/migration'
import type { MigrationState } from '$lib/sqlite/migration'
import { get, writable } from 'svelte/store'
import { deleteSnippet, upsertSnippet } from '$lib/sqlite/queries'
import { createDummySnippet } from '$lib/utitlities/testing'
import { displaySnippetToDbSnippet } from '$lib/utitlities/data-transformation'
import type { DisplayFolder } from '$lib/utitlities/data-transformation'
import type { RemoteSnippetStore } from '$lib/sqlite/sqliterg'
import type { RemoteFoldersStore } from '$lib/utitlities/persistence'

describe('in-memory client', () => {
  it('basic query', async () => {
    const client = createClient({url: ':memory:'})
    const db = drizzle(client)

    {
      const result = await db.get(sql`SELECT 1`)
      expect(result).toEqual({1: 1})
    }
    {
      const result = await db.get(sql`PRAGMA user_version`)
      expect(result).toEqual({user_version: 0})
    }
  });

  it('migrate', async () => {
    const client = createClient({url: ':memory:'})
    const db = drizzle(client)

    await migrateRemote(db, defaultMigrationQueryMap, defaultQueriesStringMap)

    {
      const result = await db.all(sql`SELECT * FROM folders`)
      expect(result.length).toEqual(1)
      expect(result[0]).toContain({
        id: 'default',
        name: 'Default',
        position: 0,
      })
    }
    {
      const result = await db.all(sql`SELECT * FROM snippets`)
      expect(result.length).toEqual(0)
    }
  })

  it('store crud', async () => {
    const client = createClient({url: ':memory:'})
    const db = drizzle(client)

    await migrateRemote(db, defaultMigrationQueryMap, defaultQueriesStringMap)
    const store = createSnippetsStore(db, 'default')
    await store.load()

    {
      const result = get(store)
      expect(result.length).toEqual(0)
    }
    {
      const newSnippet = createDummySnippet('dummy-id', 0, 0)
      await upsertSnippet(db, displaySnippetToDbSnippet('default', newSnippet))
      await store.reload()
      const result = get(store)
      expect(result.length).toEqual(1)
      expect(result[0]).toContain({
        id: 'dummy-id',
        name: 'dummy name',
        language: 'dummy language',
        createdAt: 0,
        updatedAt: 0,
      })
    }
    {
      await deleteSnippet(db, 'dummy-id')
      await store.reload()
      const result = get(store)
      expect(result.length).toEqual(0)
    }
  })

  it('local in-memory db', async () => {
    const client = createClient({url: 'http://127.0.0.1:8080'})
    const db = drizzle(client)

    await migrateRemote(db, defaultMigrationQueryMap, defaultQueriesStringMap)

    {
      const result = await db.all(sql`SELECT * FROM folders`)
      expect(result.length).toEqual(1)
      expect(result[0]).toContain({
        id: 'default',
        name: 'Default',
        position: 0,
      })
    }
    {
      const result = await db.all(sql`SELECT * FROM snippets`)
      expect(result.length).toEqual(0)
    }
  })
});

describe('store connectable', () => {
  it('blank', async () => {
    const [state, _] = await createDb({
      type: 'turso',
      dbURL: '',
      token: '',
    })
    expect(state).toBe('blank')
  })

  it('incorrect url', async () => {
    const [state, _] = await createDb({
      type: 'turso',
      dbURL: 'https://google.com',
      token: '',
    })
    expect(state).toBe('error-invalid-endpoint')
  })

  it('memory', async () => {
    const [state, _] = await createDb({
      type: 'turso',
      dbURL: ':memory:',
      token: '',
    })
    expect(state).toBe('connected')
  })

  it('unreachable', async () => {
    const [state, _] = await createDb({
      type: 'turso',
      dbURL: 'unreachable',
      token: '',
    })
    expect(state).toBe('error-unreachable')
  })

  it('authentication', async () => {
    const [state, _] = await createDb({
      type: 'turso',
      dbURL: 'libsql://crypta-thanhnguyen2187.turso.io',
      token: '',
    })
    expect(state).toBe('error-unauthenticated')
  }, 30_000)
})

describe('wrapped store', () => {
  let db: LibSQLDatabase
  let remoteSnippetStore: RemoteSnippetStore
  let remoteFoldersStore: RemoteFoldersStore

  beforeAll(async () => {
    let pair = await createDb({
      type: 'turso',
      dbURL: ':memory:',
      token: '',
    })
    db = pair[1]!
    remoteSnippetStore = await createRemoteSnippetsStore(db, 'default')
    remoteFoldersStore = await createRemoteFoldersStore(db, get(remoteSnippetStore.migrationStateStore) as MigrationState)
  })

  it('migration', async () => {
    expect(get(remoteSnippetStore.migrationStateStore)).toBe('done')
  })

  it('crud', async () => {
    await remoteSnippetStore.clearAll()
    const newSnippet = createDummySnippet('dummy-id', 0, 0)
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

  it('crud folders', async () => {
    expect(await remoteFoldersStore.isAvailable()).toBe(true)

    const newFolder: DisplayFolder = {
      id: 'new',
      name: 'New',
      position: 1,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    }
    {
      await remoteFoldersStore.upsert(newFolder)
      const folders = get(remoteFoldersStore)
      expect(folders.length).toBe(2)
      expect(folders).toContainEqual(newFolder)
    }
    {
      const result = await db.get(sql`SELECT id, name, position FROM folders WHERE id = ${newFolder.id}`)
      expect(result).toEqual({id: 'new', name: 'New', position: 1})
    }
    {
      await remoteFoldersStore.delete(newFolder.id)
      expect(get(remoteFoldersStore)).not.toContainEqual(newFolder)
    }
  })
})
