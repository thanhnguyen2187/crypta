import SQLiteESMFactory from '/wa-sqlite-async.mjs?url'
import * as SQLite from 'wa-sqlite'
// @ts-ignore
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'

export type QueryExecutor = {
  execute(query: string, ...params: SQLiteCompatibleType[]): Promise<SQLiteCompatibleType[][]>
  close(): void
}

export async function createSQLiteAPI(): Promise<SQLiteAPI> {
  // @ts-ignore
  const module = await SQLiteESMFactory()
  const sqlite3 = SQLite.Factory(module)
  const vfs = new IDBBatchAtomicVFS()
  sqlite3.vfs_register(vfs, true)
  return sqlite3
}

export async function createQueryExecutor(sqlite3: SQLiteAPI, databaseName: string): Promise<QueryExecutor> {
  const db = await sqlite3.open_v2(databaseName)
  return {
    async execute(query: string, ...params: SQLiteCompatibleType[]): Promise<SQLiteCompatibleType[][]> {
      const rows = []
      for await (const stmt of sqlite3.statements(db, query)) {
        params.forEach((param, index) => sqlite3.bind(stmt, index + 1, param))
        while (await sqlite3.step(stmt) === SQLite.SQLITE_ROW) {
          rows.push(sqlite3.row(stmt))
        }
      }
      return rows
    },
    close() {
      sqlite3.close(db)
    }
  }
}

