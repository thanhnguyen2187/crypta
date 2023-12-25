import { createQueryExecutor, createSQLiteAPI } from './query-executor'

export const sqlite3 = await createSQLiteAPI()
export const executor = await createQueryExecutor(sqlite3, 'crypta')
