import { describe, it, expect } from 'vitest'
import { createSqlitergExecutor } from './sqliterg'

// IMPORTANT: `yarn dev-db` should be run before the tests are executed
describe('executor', () => {
  it('unreachable', async () => {
    const executor = createSqlitergExecutor(
      'http://127.0.0.1:12322/crypta',
      '',
      '',
    )
    expect(await executor.isReachable()).toBe(false)
  })
  it('reachable but unauthorized', async () => {
    const executor = createSqlitergExecutor(
      'http://127.0.0.1:12321/crypta',
      '',
      '',
    )
    expect(await executor.isReachable()).toBe(true)
    expect(await executor.isAuthenticated()).toBe(false)
  })
  it('reachable and authorized', async () => {
    const executor = createSqlitergExecutor(
      'http://127.0.0.1:12321/crypta',
      'crypta',
      'crypta',
    )
    expect(await executor.isReachable()).toBe(true)
    expect(await executor.isAuthenticated()).toBe(true)
  })
})
