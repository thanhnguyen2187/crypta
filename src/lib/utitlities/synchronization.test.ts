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
      const dataState = get(dataStateStore)
      expect(dataState).toContain({
        [localSnippet.id]: 'synchronized',
        [remoteSnippet.id]: 'synchronized',
      })
    }
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

  it('merge', async () => {
    // local store initialization
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const localExecutor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const localStore = await createLocalSnippetsStore(
      localExecutor,
      writable({folderId: 'default', searchInput: '', tags: []}),
    )

    // remote store initialization
    const remoteExecutor = createAvailableExecutor()
    const remoteExecutorStore = writable(remoteExecutor)
    const dummyGlobalStateStore = writable<GlobalState>({folderId: 'default', tags: [], searchInput: ''})
    const remoteStore = await createRemoteSnippetStore(dummyGlobalStateStore, remoteExecutorStore)
    await waitUntil(remoteStore.isAvailable)
    await remoteStore.clearAll()

    // set up data for each store
    //
    // we do this instead of mutating the snippet directly since the reference
    // stays the same, and dataStateStore cannot catch it.
    const localSnippet = createNewSnippet()
    const remoteSnippet = {
      ...localSnippet,
      updatedAt: localSnippet.updatedAt + 10_000,
    }
    remoteSnippet.id = localSnippet.id
    await localStore.upsert(localSnippet)
    await remoteStore.upsert(remoteSnippet)

    // create data state store
    const dataStateStore = createSnippetsDataStateStore(localStore, remoteStore)

    {
      const dataState = get(dataStateStore)
      expect(dataState).toContain({
        [localSnippet.id]: 'conflicted',
      })
    }

    // create data manager
    const dataManager = createSnippetsDataManager(localStore, remoteStore, dataStateStore, 1_000)
    await dataManager.merge(localSnippet)
    {
      const dataState = get(dataStateStore)
      expect(dataState).toContain({
        [localSnippet.id]: 'synchronized',
      })
    }
    {
      const localUpdatedAt = localExecutor.execute('SELECT updated_at FROM snippets WHERE id = ?', localSnippet.id)
      const remoteUpdatedAt = remoteExecutor.execute('SELECT updated_at FROM snippets WHERE id = ?', [remoteSnippet.id])
      expect(localUpdatedAt).toEqual(remoteUpdatedAt)
    }
  }, 30_000)
})
