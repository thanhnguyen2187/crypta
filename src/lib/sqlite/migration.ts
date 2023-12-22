import type { QueryExecutor } from './query-executor'
import { readSnippets } from '$lib/utitlities/persistence';

type MigrationQueryMap = {[userVersion: number]: string}

const defaultMigrationQueryMap = {
  0: '',
}

export async function migrate(executor: QueryExecutor, migrationQueryMap: MigrationQueryMap) {
  let [[currentUserVersion]] = await executor.executeResult('PRAGMA user_version;') as [[number]]
  while (migrationQueryMap[currentUserVersion]) {
    const query = migrationQueryMap[currentUserVersion]
    await executor.execute(query)
    currentUserVersion += 1
  }
}

export async function v0DataImport(executor: QueryExecutor) {
}
