import { describe, it, expect } from 'vitest'
import { createRemoteDb, createSqlitergExecutor } from './sqliterg'
import { migrate, defaultMigrationQueryMap, defaultQueriesStringMap } from './migration'
import type { MigrationState } from './migration'
import { sql } from 'drizzle-orm'
import { writable } from 'svelte/store'
import { folders } from '$lib/sqlite/schema'

// IMPORTANT: `yarn dev-db` should be run before the tests are executed
describe('executor', () => {
  it('unreachable', async () => {
    const executor = createSqlitergExecutor(
      'http://127.0.0.1:12322/crypta',
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
      expect(result.results[0]).toEqual({
        resultSet: [
          {
            "1": 1,
          },
        ],
        success: true,
      })
    }
    {
      const result = await executor.execute('PRAGMA user_version', [])
      expect(result.results[0]).toEqual({
        resultSet: [
          {
            user_version: 0,
          },
        ],
        success: true,
      })
    }
  })
})

describe('remote database', async () => {
  it('basic query', async () => {
    const executor = createSqlitergExecutor(
      'http://127.0.0.1:12321/crypta',
      'crypta',
      'crypta',
    )
    const remoteDb = await createRemoteDb(executor)
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
    const remoteDb = await createRemoteDb(executor)
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
      const result = await remoteDb.get(sql`SELECT * FROM snippets`)
      expect(result).toEqual([])
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
      }).from(folders)
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
