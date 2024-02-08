import AsyncSQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite-async.mjs'
import SyncSQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import * as SQLite from 'wa-sqlite'
// @ts-ignore
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
import { MemoryAsyncVFS } from 'wa-sqlite/src/examples/MemoryAsyncVFS.js'
// @ts-ignore
import { OriginPrivateFileSystemVFS } from 'wa-sqlite/src/examples/OriginPrivateFileSystemVFS.js'

export type WASqliteExecutor = {
  execute(query: string, ...params: SQLiteCompatibleType[]): Promise<SQLiteCompatibleType[][]>
  close(): Promise<void>
}

export async function createSQLiteAPI(): Promise<SQLiteAPI> {
  const module = await AsyncSQLiteESMFactory({
    // We set this configuration to load WASM files from `/`. More specifically,
    // they are `wa-sqlite.wasm` and `wa-sqlite-async.wasm`. The files are
    // copied to `static/`, and served by Vite at `/`. Without this, the
    // application would not work in "production environment" (static file
    // serving on GitHub Pages).
    //
    // Also see explanation from `wa-sqlite`'s author:
    // https://github.com/rhashimoto/wa-sqlite/issues/15
    locateFile(file: string) {
      return `./${file}`
    }
  })
  const sqlite3 = SQLite.Factory(module)
  const vfs = new IDBBatchAtomicVFS()
  // const vfs = new OriginPrivateFileSystemVFS()
  sqlite3.vfs_register(vfs, true)
  return sqlite3
}

export async function createSQLiteAPIV2(
  asyncModule: boolean = true,
  wasmBaseURL: string = '.',
  vfs_type:
    | 'IDBBatchAtomicVFS'
    | 'OriginPrivateFileSystemVFS'
    | 'MemoryAsyncVFS'
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
  const module = asyncModule
    ? await AsyncSQLiteESMFactory(config)
    : await SyncSQLiteESMFactory(config)
  const sqlite3 = SQLite.Factory(module)
  // IMPORTANT: VFS should be registered with the correct sync/async factory.
  //
  // See related information in this issue:
  // https://github.com/rhashimoto/wa-sqlite/issues/137
  let vfs
  switch (vfs_type) {
    case 'IDBBatchAtomicVFS':
      vfs = new IDBBatchAtomicVFS()
      break
    case 'MemoryAsyncVFS':
      vfs = new MemoryAsyncVFS()
      break
    case 'OriginPrivateFileSystemVFS':
      vfs = new OriginPrivateFileSystemVFS()
      break
    default:
      throw new Error(`createSQLiteAPIV2: unsupported vfs_type: ${vfs_type}`)
  }
  sqlite3.vfs_register(vfs, true)
  return sqlite3
}

export async function createQueryExecutor(sqlite3: SQLiteAPI, databaseName: string): Promise<WASqliteExecutor> {
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
  return {
    async execute(query: string, ...params: SQLiteCompatibleType[]): Promise<SQLiteCompatibleType[][]> {
      // We split to an `executeFn` and use Web Locks API since `wa-sqlite`
      // doesn't allow concurrent usage of `SQLiteESMFactory`.
      //
      // Also see this issue: https://github.com/rhashimoto/wa-sqlite/issues/139
      return navigator.locks.request('crypta_executor', (lock) => executeFn(query, ...params))
    },
    async close() {
      await sqlite3.close(db)
    }
  }
}
