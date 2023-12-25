import type { QueryExecutor } from './query-executor'
import { readCatalog, readSnippets } from '$lib/utitlities/persistence'
import { fetchRawString } from '$lib/utitlities/fetch-raw-string';
import { folders } from '$lib/sqlite/schema'
import { sql } from 'drizzle-orm'
import { localDb } from '$lib/sqlite/global';

export type MigrationQueryMap = {[userVersion: number]: string}

export const defaultMigrationQueryMap: MigrationQueryMap = {
  0: '0000_calm_gamma_corps.sql',
}

export async function migrate(executor: QueryExecutor, migrationQueryMap: MigrationQueryMap) {
  let [[currentUserVersion]] = await executor.executeResult('PRAGMA user_version;') as [[number]]
  while (migrationQueryMap[currentUserVersion]) {
    const migrationQueryName = migrationQueryMap[currentUserVersion]
    const migrationQuery = await fetchRawString(`queries/${migrationQueryName}`)
    await executor.execute(migrationQuery)
    if (currentUserVersion === 0) {
      const name = '0000_seed_default_folder.sql'
      const seedFolderQuery = await fetchRawString(`queries/${name}`)
      await executor.execute(seedFolderQuery)
    }
    currentUserVersion += 1
    await executor.execute(`PRAGMA user_version = ${currentUserVersion}`)
  }

  debugger
  await localDb.run(sql`PRAGMA user_version;`)
}

export async function v0DataImport(executor: QueryExecutor) {
  const catalog = await readCatalog()
  const snippets = await readSnippets()

  Object.entries(catalog).map(
    ([folderId, folder], index) => {
      return {
        id: folderId,
        name: folder.displayName,
        position: index,
      }
    }
  ).forEach(
    (record) => {
      const query = sql`insert into folders`
    }
  )
}
