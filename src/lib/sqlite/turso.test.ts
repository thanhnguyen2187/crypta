import { describe, expect, it } from 'vitest'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { sql } from 'drizzle-orm'
import { createSnippetsStore, migrateRemote } from './turso'
import { defaultMigrationQueryMap, defaultQueriesStringMap } from '$lib/sqlite/migration';
import { createLocalFoldersStore } from '$lib/sqlite/wa-sqlite';
import { get, writable } from 'svelte/store'
import { deleteSnippet, upsertSnippet } from '$lib/sqlite/queries';
import { createDummySnippet } from '$lib/utitlities/testing';
import { displaySnippetToDbSnippet } from '$lib/utitlities/data-transformation';

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
    const store = createSnippetsStore(db, writable('default'))
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
});
