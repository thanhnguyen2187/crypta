import { createQueryExecutor, createSQLiteAPI } from './query-executor'
import type { QueryExecutor } from './query-executor'
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core'
import { SQL, sql, StringChunk } from 'drizzle-orm'

function dummyTag(strings: string[]): string[] {
  return strings
}

class DummyTemplateStringArray extends Array<string> {
  public readonly raw: string[]

  constructor(raw: string) {
    super()
    this.raw = [raw]
    this.push(raw)
  }
}

export async function createLocalDb(executor: QueryExecutor) {
  const sqliteDialect = new SQLiteSyncDialect()
  return drizzle(async (queryString, params, method) => {
    debugger
    const dummy = new DummyTemplateStringArray(queryString)
    console.log(sqliteDialect.sqlToQuery(sql(dummy, params)).sql)
    return {rows: []}
  })
}

export const sqlite3 = await createSQLiteAPI()
export const executor = await createQueryExecutor(sqlite3, 'crypta')
export const localDb = await createLocalDb(executor)
