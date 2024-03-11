import type { MigrationQueryMap, QueriesStringMap } from '$lib/sqlite/migration'
import { sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql'

export async function migrateRemote(
  db: LibSQLDatabase,
  migrationQueryMap: MigrationQueryMap,
  queriesStringMap: QueriesStringMap,
) {
  const response = await db.get(sql`PRAGMA user_version`)
  let {user_version: currentUserVersion} = response as {user_version: number}
  while (migrationQueryMap[currentUserVersion]) {
    const migrationQueryPath = migrationQueryMap[currentUserVersion]
    const migrationQueryString = queriesStringMap[migrationQueryPath]
    if (!migrationQueryString) {
      throw new Error(`migrate: could not find query string of ${migrationQueryPath}`)
    }
    await db.run(sql.raw(migrationQueryString))
    if (currentUserVersion === 0) {
      const path = '/db/0000_seed_default_folder.sql'
      const seedFolderQuery = queriesStringMap[path]
      await db.run(sql.raw(seedFolderQuery))
    }
    currentUserVersion += 1
    await db.run(sql.raw(`PRAGMA user_version = ${currentUserVersion}`))
  }
}
