import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import {
  createDb,
  createSQLiteAPI,
  createQueryExecutor, migrate,
} from './wa-sqlite'
import type { WASQLiteExecutor } from './wa-sqlite'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { createWASqliteMockWASMHandler } from '$lib/utitlities/testing'
import { sql } from 'drizzle-orm'
import { defaultMigrationQueryMap, defaultQueriesStringMap } from '$lib/sqlite/migration'

const handlers = createWASqliteMockWASMHandler()
const server = setupServer(...handlers)
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterAll(() => {
  server.close()
})

describe('happy path', async () => {
  let sqliteAPI: SQLiteAPI
  let executor: WASQLiteExecutor
  let localDb: SqliteRemoteDatabase

  beforeAll(async () => {
    sqliteAPI = await createSQLiteAPI('http://mock.local', 'MemoryVFS')
    executor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    localDb = createDb(executor)
  })

  it('basic query', async () => {
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
    await migrate(
      localDb,
      async () => {},
      defaultMigrationQueryMap,
      defaultQueriesStringMap,
    )
    {
      const result = await localDb.all(sql`SELECT * FROM folders`)
      expect(result.length).toBe(1)
    }
  })
})
