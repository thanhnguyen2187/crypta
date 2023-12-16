// place files you want to import through the `$lib` alias in this folder.

import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import * as SQLite from 'wa-sqlite'

export async function hello() {
  const module = await SQLiteESMFactory()
  const sqlite3 = SQLite.Factory(module)
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
