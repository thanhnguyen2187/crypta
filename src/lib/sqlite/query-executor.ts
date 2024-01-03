import SQLiteESMFactory from '/wa-sqlite-async.mjs?url'
// import SQLiteESMFactory from '/wa-sqlite.mjs?url'
import * as SQLite from 'wa-sqlite'
// @ts-ignore
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
// @ts-ignore
import { OriginPrivateFileSystemVFS } from 'wa-sqlite/src/examples/OriginPrivateFileSystemVFS.js'

export type QueryExecutor = {
  execute(query: string, ...params: SQLiteCompatibleType[]): Promise<SQLiteCompatibleType[][]>
  close(): Promise<void>
}

export async function createSQLiteAPI(): Promise<SQLiteAPI> {
  // @ts-ignore
  const module = await SQLiteESMFactory()
  const sqlite3 = SQLite.Factory(module)
  const vfs = new IDBBatchAtomicVFS()
  // const vfs = new OriginPrivateFileSystemVFS()
  sqlite3.vfs_register(vfs, true)
  return sqlite3
}

export async function createQueryExecutor(sqlite3: SQLiteAPI, databaseName: string): Promise<QueryExecutor> {
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
