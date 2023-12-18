// import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import SQLiteESMFactory from '/wa-sqlite.mjs?url'
import * as SQLite from 'wa-sqlite'
// @ts-ignore
// import * as IDBBatchAtomicModule from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
import * as IDBBatchAtomicModule from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'

export async function hello() {
  // @ts-ignore
  const module = await SQLiteESMFactory()
  const sqlite3 = SQLite.Factory(module)
  const vfs = new IDBBatchAtomicModule['IDBBatchAtomicVFS']([])
  await vfs.isReady
  sqlite3.vfs_register(vfs, true)
  const db = await sqlite3.open_v2('mydb')
  const queryContent = (await import('../../../queries/01__snippet_creation.sql?raw')).default
  debugger
  await sqlite3.exec(
    db,
    // `SELECT 'Hello world'`,
    queryContent,
    // (row, columns) => {
    //   console.log(row)
    // }
  )
  // await sqlite3.exec(
  //   db,
  //   `SELECT * FROM snippets;`,
  //   (row, columns) => {
  //     console.log(row)
  //   }
  // )
  await sqlite3.close(db);
}
