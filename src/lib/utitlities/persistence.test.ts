import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createRemoteServerURLHandler, createWASqliteMockWASMHandler } from '$lib/utitlities/testing';
import { setupServer } from 'msw/node';
import {
  createLocalDb, createLocalFoldersStore,
  createQueryExecutor,
  createSQLiteAPIV2,
  migrateLocal
} from '$lib/sqlite/wa-sqlite';
import type { LocalFoldersStore } from '$lib/utitlities/persistence'
import { get, writable } from 'svelte/store'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import { sql } from 'drizzle-orm'
import { createAvailableExecutor } from '$lib/sqlite/sqliterg.test'
import { createRemoteDb, migrateRemote } from '$lib/sqlite/sqliterg'
import { defaultMigrationQueryMap, defaultQueriesStringMap } from '$lib/sqlite/migration'
import type { MigrationState } from '$lib/sqlite/migration'

