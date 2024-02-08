import AsyncSQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite-async.mjs'
import SyncSQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import * as SQLite from 'wa-sqlite'
// @ts-ignore
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
import { MemoryAsyncVFS } from 'wa-sqlite/src/examples/MemoryAsyncVFS.js'
import { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'
// @ts-ignore
import { OriginPrivateFileSystemVFS } from 'wa-sqlite/src/examples/OriginPrivateFileSystemVFS.js'
import { drizzle } from 'drizzle-orm/sqlite-proxy';

export type WASqliteExecutor = {
  execute(query: string, ...params: SQLiteCompatibleType[]): Promise<SQLiteCompatibleType[][]>
  close(): Promise<void>
}

export async function createSQLiteAPIV2(
  wasmBaseURL: string = '.',
  vfs_type:
    | 'IDBBatchAtomicVFS'
    | 'OriginPrivateFileSystemVFS'
    | 'MemoryAsyncVFS'
    | 'MemoryVFS'
    = 'IDBBatchAtomicVFS',
): Promise<SQLiteAPI> {
  const config = {
    // We set this configuration to load WASM files from the correct path.
    //
    // Also see explanation from `wa-sqlite`'s author:
    // https://github.com/rhashimoto/wa-sqlite/issues/15
    locateFile(file: string) {
      return `${wasmBaseURL}/${file}`
    }
  }
  // IMPORTANT: VFS should be registered with the correct sync/async factory.
  //
  // See related information in this issue:
  // https://github.com/rhashimoto/wa-sqlite/issues/137
  let vfs
  let module
  switch (vfs_type) {
    case 'IDBBatchAtomicVFS':
      module = await AsyncSQLiteESMFactory(config)
      vfs = new IDBBatchAtomicVFS()
      break
    case 'MemoryAsyncVFS':
      module = await AsyncSQLiteESMFactory(config)
      vfs = new MemoryAsyncVFS()
      break
    case 'MemoryVFS':
      module = await SyncSQLiteESMFactory(config)
      vfs = new MemoryVFS()
      break
    case 'OriginPrivateFileSystemVFS':
      module = await AsyncSQLiteESMFactory(config)
      vfs = new OriginPrivateFileSystemVFS()
      break
    default:
      throw new Error(`createSQLiteAPIV2: unsupported vfs_type: ${vfs_type}`)
  }
  const sqlite3 = SQLite.Factory(module)
  sqlite3.vfs_register(vfs, true)
  return sqlite3
}

export async function createQueryExecutor(
  sqlite3: SQLiteAPI,
  databaseName: string,
  locking: boolean = true,
): Promise<WASqliteExecutor> {
  const db = await sqlite3.open_v2(databaseName)
  async function executeFn(query: string, ...params: SQLiteCompatibleType[]): Promise<SQLiteCompatibleType[][]> {
    const rows = []
    for await (const stmt of sqlite3.statements(db, query)) {
      params.forEach((param, index) => sqlite3.bind(stmt, index + 1, param))
      while (await sqlite3.step(stmt) === SQLite.SQLITE_ROW) {
        rows.push(sqlite3.row(stmt))
      }
    }
    return rows
  }
  async function close() {
    await sqlite3.close(db)
  }
  async function executeLocking(query: string, ...params: SQLiteCompatibleType[]) {
    return await navigator.locks.request('crypta_executor', (lock) => executeFn(query, ...params))
  }
  async function executeWithoutLocking(query: string, ...params: SQLiteCompatibleType[]) {
    return await executeFn(query, ...params)
  }

  if (locking) {
    return {
      execute: executeLocking,
      close,
    }
  } else {
    return {
      execute: executeWithoutLocking,
      close,
    }
  }
}

export function createLocalDb(executor: WASqliteExecutor) {
  return drizzle(async (queryString, params, method) => {
    const result = await executor.execute(queryString, ...params)
    if (method === 'get' && result.length > 0) {
      return {rows: result[0]}
    }
    return {rows: result}
  })
}
