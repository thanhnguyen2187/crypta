import { describe, it, expect } from 'vitest'
import { createSqlitergExecutor } from './sqliterg'

describe('Remote DB Test', () => {
  it('locally executable', async () => {
    const executor = createSqlitergExecutor('http://127.0.0.1:12321', 'crypta', 'crypta')
    expect(await executor.isReachable()).toBe(true)
    expect(await executor.isAuthenticated()).toBe(true)
  });
});
