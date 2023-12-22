import { createQueryExecutor, createSQLiteAPI } from './query-executor'

const sqlite3 = await createSQLiteAPI()
const executor = createQueryExecutor(sqlite3, 'crypta')
