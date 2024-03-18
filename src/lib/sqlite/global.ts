import { createDb, createQueryExecutor, createSQLiteAPI } from './wa-sqlite'

export const sqlite3 = await createSQLiteAPI()
export const executor = await createQueryExecutor(sqlite3, 'crypta')
export const localDb = createDb(executor)
