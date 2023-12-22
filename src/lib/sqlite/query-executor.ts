import SQLiteESMFactory from '/wa-sqlite-async.mjs?url'
import * as SQLite from 'wa-sqlite'
// @ts-ignore
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'

type ResultCallback = (row: SQLiteCompatibleType[], columns: string[]) => void

export type QueryExecutor = {
  execute(query: string, callback?: ResultCallback): Promise<number>
  executeResult(query: string): Promise<SQLiteCompatibleType[][]>
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

export async function createQueryExecutor(api: SQLiteAPI, databaseName: string): Promise<QueryExecutor> {
  const db = await api.open_v2(databaseName)
  return {
    execute(query: string, callback: ResultCallback | undefined): Promise<number> {
      return api.exec(db, query, callback)
    },
    executeResult(query: string): Promise<SQLiteCompatibleType[][]> {
      return new Promise(
        (resolve, reject) => {
          const rows: SQLiteCompatibleType[][] = []
          api.exec(db, query, (row, columns) => {
            rows.push(row)
          }).then(() => {
            resolve(rows)
          }).catch(reject)
        }
      )
    },
    close() {
      api.close(db)
    }
  }
}

