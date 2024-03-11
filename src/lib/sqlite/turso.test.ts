import { describe, expect, it } from 'vitest'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { sql } from 'drizzle-orm'
import { migrateRemote } from './turso'
import { defaultMigrationQueryMap, defaultQueriesStringMap } from '$lib/sqlite/migration';

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
    }
  })
});
