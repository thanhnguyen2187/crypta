import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { get, writable } from 'svelte/store'
import { createSnippetsDataManager, createSnippetsDataStateStore } from './synchronization'
import type { GlobalState, Snippet } from './persistence'
import { createLocalSnippetsStore, createQueryExecutor, createSQLiteAPIV2 } from '$lib/sqlite/wa-sqlite'
import { setupServer } from 'msw/node'
import { createRemoteServerURLHandler, createWASqliteMockWASMHandler } from '$lib/utitlities/tests-setup'
import { createAvailableExecutor } from '$lib/sqlite/sqliterg.test'
import { createRemoteSnippetStore } from '$lib/sqlite/sqliterg'
import { createNewSnippet } from './persistence'
import { waitUntil } from '$lib/utitlities/wait-until'

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
  const handlers = [
    ...createWASqliteMockWASMHandler(),
    ...createRemoteServerURLHandler(),
  ]
  const server = setupServer(...handlers)
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })
  afterAll(() => {
    server.close()
  })

  it('start', async () => {
    // local store initialization
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const localExecutor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const localStore = await createLocalSnippetsStore(
      localExecutor,
      writable({folderId: 'default', searchInput: '', tags: []}),
    )

    // remote store initialization
    const remoteExecutor = createAvailableExecutor()
    const dummyExecutorStore = writable(remoteExecutor)
    const dummyGlobalStateStore = writable<GlobalState>({folderId: 'default', tags: [], searchInput: ''})
    const remoteStore = await createRemoteSnippetStore(dummyGlobalStateStore, dummyExecutorStore)
    await waitUntil(remoteStore.isAvailable)
    await remoteStore.clearAll()

    // ensure that each store has one record
    const localSnippet = createNewSnippet()
    await localStore.upsert(localSnippet)
    const remoteSnippet = createNewSnippet()
    await remoteStore.upsert(remoteSnippet)

    // create data manager
    const dataStateStore = createSnippetsDataStateStore(localStore, remoteStore)
    const dataManager = createSnippetsDataManager(localStore, remoteStore, dataStateStore, 1_000)

    {
      const localSnippetMap = get(dataStateStore.localMap)
      expect(localSnippetMap).toContain({
        [localSnippet.id]: localSnippet,
      })
      const remoteSnippetMap = get(dataStateStore.remoteMap)
      expect(remoteSnippetMap).toContain({
        [remoteSnippet.id]: remoteSnippet,
      })
    }
    {
      const dataState = get(dataStateStore)
      expect(dataState).toContain({
        [localSnippet.id]: 'local-only',
        [remoteSnippet.id]: 'remote-only',
      })
    }

    dataManager.start()
    await new Promise(resolve => setTimeout(resolve, 1_500))

    {
      const localSnippets = get(localStore)
      const remoteSnippets = get(remoteStore)

      expect(localSnippets.length).toBe(2)
      expect(remoteSnippets.length).toBe(2)

      expect(localSnippets).toEqual(
        expect.arrayContaining([localSnippet, remoteSnippet])
      )
      expect(remoteSnippets).toEqual(
        expect.arrayContaining([localSnippet, remoteSnippet])
      )
    }

  }, {timeout: 30_000})
})
