// import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import SQLiteESMFactory from '/wa-sqlite.mjs?url'
import * as SQLite from 'wa-sqlite'
// @ts-ignore
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'

export async function hello() {
  // @ts-ignore
  const module = await SQLiteESMFactory()
  const sqlite3 = SQLite.Factory(module)
  sqlite3.vfs_register(IDBBatchAtomicVFS)
  const db = await sqlite3.open_v2('mydb')
  const queryContent = (await import('../../../queries/01__snippet_creation.sql?raw')).default
  await sqlite3.exec(
    db,
    queryContent,
    (row, columns) => {
      console.log(row)
    }
  )
  await sqlite3.close(db);
}
