import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import {
  createDb,
  createSQLiteAPI,
  createQueryExecutor,
} from './wa-sqlite'
import { createWASqliteMockWASMHandler } from '$lib/utitlities/testing'
import { sql } from 'drizzle-orm'

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
    const sqliteAPI = await createSQLiteAPI('http://mock.local', 'MemoryVFS')
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
    const sqliteAPI = await createSQLiteAPI('http://mock.local', 'MemoryVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const localDb = createDb(executor)
    {
      const result = await localDb.run(sql`SELECT 1`)
      expect(result).toEqual({rows: [[1]]})
    }
    {
      const result = await localDb.run(sql`PRAGMA user_version`)
      expect(result).toEqual({rows: [[0]]})
    }
  })
})
