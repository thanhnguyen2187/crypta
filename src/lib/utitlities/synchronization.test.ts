import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { get, writable } from 'svelte/store'
import { createSnippetsDataStateStore } from './synchronization'
import type { Snippet } from './persistence'
import {
  createLocalDb,
  createLocalSnippetsStore,
  createQueryExecutor,
  createSQLiteAPIV2
} from '$lib/sqlite/wa-sqlite';
import { setupServer } from 'msw/node';
import { createWASqliteMockWASMHandler } from '$lib/utitlities/tests-setup';

function createDummySnippet(id: string, createdAt: number, updatedAt: number): Snippet {
  return {
    id,
    name: 'dummy',
    language: 'dummy',
    text: 'dummy',
    tags: [],
    encrypted: false,
    position: 0,
    createdAt,
    updatedAt,
  }
}

describe('snippets data state store', () => {
  it('empty store', () => {
    const dummyLocalStore = writable<Snippet[]>([])
    const dummyRemoteStore = writable<Snippet[]>([])
    const store = createSnippetsDataStateStore(dummyLocalStore, dummyRemoteStore)
    expect(get(store)).toEqual({})
  })
  it('local only', () => {
    const localStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
    ])
    const remoteStore = writable<Snippet[]>([])
    const store = createSnippetsDataStateStore(localStore, remoteStore)
    expect(get(store)).toEqual({
      'a': 'local-only',
    })
  })
  it('remote only', () => {
    const localStore = writable<Snippet[]>([])
    const remoteStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
    ])
    const store = createSnippetsDataStateStore(localStore, remoteStore)
    expect(get(store)).toEqual({
      'a': 'remote-only',
    })
  })
  it('synchronized', () => {
    const localStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
    ])
    const remoteStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
    ])
    const store = createSnippetsDataStateStore(localStore, remoteStore)
    expect(get(store)).toEqual({
      'a': 'synchronized',
    })
  })
  it('conflicted', () => {
    const localStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
      createDummySnippet('b', 0, 1),
    ])
    const remoteStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
      createDummySnippet('b', 0, 2),
    ])
    const store = createSnippetsDataStateStore(localStore, remoteStore)
    expect(get(store)).toEqual({
      'a': 'synchronized',
      'b': 'conflicted',
    })
  })
})

describe('data manager', () => {
  const handlers = createWASqliteMockWASMHandler()
  const server = setupServer(...handlers)
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })
  afterAll(() => {
    server.close()
  })

  it('start', async () => {
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryAsyncVFS')
    const executor = await createQueryExecutor(sqliteAPI, 'crypta')
    const localDb = createLocalDb(executor)
    const localStore = await createLocalSnippetsStore(
      executor,
      writable({folderId: 'default', searchInput: '', tags: []}),
    )
  }, {timeout: 30_000})
})
