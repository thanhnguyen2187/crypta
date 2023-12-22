import SQLiteESMFactory from '/wa-sqlite.mjs?url'
import SQLite from 'wa-sqlite'
// @ts-ignore
import IDBBatchAtomicVFS from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'

type ResultCallback = (row: SQLiteCompatibleType[], columns: string[]) => void

type QueryExecutor = {
  execute(query: string, callback: ResultCallback | undefined): Promise<number>
  close(): void
}

async function createSQLiteAPI(): Promise<SQLiteAPI> {
  // @ts-ignore
  const module = await SQLiteESMFactory()
  const sqlite3 = SQLite.Factory(module)
  const vfs = new IDBBatchAtomicVFS()
  await vfs.isReady
  sqlite3.vfs_register(vfs, true)
  return sqlite3
}

async function createQueryExecutor(api: SQLiteAPI, databaseName: string): Promise<QueryExecutor> {
  const db = await api.open_v2(databaseName)
  return {
    execute(query: string, callback: ResultCallback | undefined): Promise<number> {
      return api.exec(db, query, callback)
    },
    executeResult(query: string): Promise<any> {
      return new Promise(
        (resolve) => {}
      )
    },
    close() {
      api.close(db)
    }
  }
}

type MigrationQueryMap = {[userVersion: number]: string}
const UserVersionToQueryName = {
  0: '0000_new_the_initiative.sql',
}

async function migrate(executor: QueryExecutor, migrationQueryMap: MigrationQueryMap) {
  const currentUserVersion = await executor.execute(
    'PRAGMA user_version;',
    (row) => {

    }
  )
}
