import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import * as SQLite from 'wa-sqlite'
import { IndexedDbVFS } from 'wa-sqlite/src/examples/IndexedDbVFS.js';
import * as VFS from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'

export async function hello() {
  const module = await SQLiteESMFactory()
  const sqlite3 = SQLite.Factory(module)
  sqlite3.vfs_register(IDBBatchAtomicVFS)
  const db = await sqlite3.open_v2('mydb')
  await sqlite3.exec(
    db,
    `SELECT 'Hello world!'`,
    (row, columns) => {
      console.log(row)
    }
  )
  await sqlite3.close(db);
}
