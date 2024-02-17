import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createRemoteServerURLHandler, createWASqliteMockWASMHandler } from '$lib/utitlities/testing';
import { setupServer } from 'msw/node';
import {
  createLocalDb,
  createQueryExecutor,
  createSQLiteAPIV2,
  migrateLocal
} from '$lib/sqlite/wa-sqlite';
import { createLocalFoldersStore } from '$lib/utitlities/persistence'
import type { LocalFoldersStore } from '$lib/utitlities/persistence'
import { get, writable } from 'svelte/store'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import { sql } from 'drizzle-orm'
import { createAvailableExecutor } from '$lib/sqlite/sqliterg.test'
import { createRemoteDb, migrateRemote } from '$lib/sqlite/sqliterg'
import { defaultMigrationQueryMap, defaultQueriesStringMap } from '$lib/sqlite/migration'
import type { MigrationState } from '$lib/sqlite/migration'

describe('folders store', () => {
  const handlers = [
    ...createWASqliteMockWASMHandler(),
    ...createRemoteServerURLHandler(),
  ]
  const server = setupServer(...handlers)
  let localDb: SqliteRemoteDatabase
  let localStore: LocalFoldersStore
  let remoteDb: SqliteRemoteDatabase
  let remoteStore: LocalFoldersStore
  beforeAll(async () => {
    server.listen({ onUnhandledRequest: 'error' })

    // local database initialization
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const localExecutor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    localDb = createLocalDb(localExecutor)
    await migrateLocal(
      localExecutor,
      async () => {},
      defaultMigrationQueryMap,
      defaultQueriesStringMap,
    )
    localStore = await createLocalFoldersStore(localDb, writable<MigrationState>('done'))

    // remote database initialization
    const remoteExecutor = createAvailableExecutor()
    await migrateRemote(
      remoteExecutor,
      defaultMigrationQueryMap,
      defaultQueriesStringMap,
    )
    remoteDb = createRemoteDb(remoteExecutor)
    remoteStore = await createLocalFoldersStore(remoteDb, writable<MigrationState>('done'))
  })
  afterAll(() => {
    server.close()
  })

  it('local', () => {
    expect(localStore).toBeDefined()
    {
      const folders = get(localStore)
      expect(folders).toEqual([{
        id: 'default',
        name: 'Default',
        position: 0,
      }])
    }
  })

  it('local crud', async () => {
    const newFolder = {
      id: 'new',
      name: 'New',
      position: 1,
    }
    {
      await localStore.upsert(newFolder)
      expect(get(localStore)).toContain(newFolder)
    }
    {
      const result = await localDb.get(sql`SELECT id, name, position FROM folders WHERE id = ${newFolder.id}`)
      expect(result).toEqual(['new', 'New', 1])
    }
    {
      await localStore.delete(newFolder.id)
      expect(get(localStore)).not.toContain(newFolder)
    }
  })

  it('remote', async () => {
    // A workaround for the case where the remote store has its data populated
    // after the check happens.
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(remoteStore).toBeDefined()
    {
      const folders = get(remoteStore)
      expect(folders).toEqual([{
        id: 'default',
        name: 'Default',
        position: 0,
      }])
    }
  })

  it('remote crud', async () => {
    const newFolder = {
      id: 'new',
      name: 'New',
      position: 1,
    }
    {
      await remoteStore.upsert(newFolder)
      expect(get(remoteStore)).toContain(newFolder)
    }
    {
      const result = await remoteDb.get(sql`SELECT id, name, position FROM folders WHERE id = ${newFolder.id}`)
      expect(result).toEqual(['new', 'New', 1])
    }
    {
      await remoteStore.delete(newFolder.id)
      expect(get(remoteStore)).not.toContain(newFolder)
    }
  })
})
