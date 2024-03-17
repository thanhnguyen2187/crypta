import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { get, writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import {
  createHigherFoldersStore,
  createHigherSnippetsStore,
  createSnippetsDataManager,
  createSnippetsDataStateStore
} from './synchronization'
import type { GlobalState, LocalFoldersStore, RemoteFoldersStore, Snippet, SnippetStore } from './persistence'
import { createNewSnippet } from './persistence'
import {
  createLocalDb,
  createLocalFoldersStore,
  createLocalSnippetsStore,
  createQueryExecutor,
  createSQLiteAPIV2, migrateLocal
} from '$lib/sqlite/wa-sqlite'
import { setupServer } from 'msw/node'
import {
  createDummySnippet,
  createRemoteServerURLHandler,
  createWASqliteMockWASMHandler
} from '$lib/utitlities/testing'
import { createAvailableExecutor, createEmptyExecutor } from '$lib/sqlite/sqliterg.test'
import {
  createRemoteDb,
  createRemoteFoldersStore,
  createRemoteSnippetStore,
  migrateRemote,
} from '$lib/sqlite/sqliterg'
import type { RemoteSnippetStore, SqlitergExecutor } from '$lib/sqlite/sqliterg'
import { waitUntil } from '$lib/utitlities/wait-until'
import { defaultMigrationQueryMap, defaultQueriesStringMap } from '$lib/sqlite/migration';
import type { DisplayFolder } from '$lib/utitlities/data-transformation';
import { createDb, createRemoteSnippetsStoreV2 } from '$lib/sqlite/turso';
import { sql } from 'drizzle-orm';

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
    const dbPairStore = writable(await createDb({type: 'turso', dbURL: ':memory:', token: ''}))
    const folderIdStore = writable('default')
    const remoteStore = await createRemoteSnippetsStoreV2(dbPairStore, folderIdStore)
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
      expect(remoteSnippetMap[remoteSnippet.id]).toBeDefined()
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
    const remoteDbPair = await createDb({type: 'turso', dbURL: ':memory:', token: ''})
    const dbPairStore = writable(remoteDbPair)
    const folderIdStore = writable('default')
    const remoteStore = await createRemoteSnippetsStoreV2(dbPairStore, folderIdStore)
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
      const [[localUpdatedAt]] = await localExecutor.execute('SELECT updated_at FROM snippets WHERE id = ?', localSnippet.id)
      const {updated_at: remoteUpdatedAt} = await remoteDbPair[1]?.get(sql`SELECT updated_at FROM snippets WHERE id = ${remoteSnippet.id}`) as {updated_at: string}
      expect(localUpdatedAt).toEqual(remoteUpdatedAt)
    }
  }, 30_000)
})

describe('higher snippets store', () => {
  const handlers = [
    ...createWASqliteMockWASMHandler(),
    ...createRemoteServerURLHandler(),
  ]
  const server = setupServer(...handlers)
  let localStore: SnippetStore
  let remoteStore: RemoteSnippetStore
  let dummyExecutorStore: Writable<SqlitergExecutor>
  let higherSnippetsStore: SnippetStore
  beforeAll(async () => {
    server.listen({ onUnhandledRequest: 'error' })

    // local store initialization
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const localExecutor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    localStore = await createLocalSnippetsStore(
      localExecutor,
      writable({folderId: 'default', searchInput: '', tags: []}),
    )

    // remote store initialization
    const remoteExecutor = createAvailableExecutor()
    dummyExecutorStore = writable(remoteExecutor)
    const dummyGlobalStateStore = writable<GlobalState>({folderId: 'default', tags: [], searchInput: ''})
    remoteStore = await createRemoteSnippetStore(dummyGlobalStateStore, dummyExecutorStore)
    await waitUntil(remoteStore.isAvailable)

    // higher store initialization
    higherSnippetsStore = createHigherSnippetsStore(localStore, remoteStore)
  })
  beforeEach(async () => {
    await remoteStore.clearAll()
    await localStore.clearAll()
  })
  afterAll(() => {
    server.close()
  })

  it('happy path store', async () => {
    {
      const result = get(higherSnippetsStore)
      expect(result).toEqual([])
    }
    {
      const snippet = createNewSnippet()
      await higherSnippetsStore.upsert(snippet)
      expect(get(higherSnippetsStore)).toEqual([snippet])
      expect(get(localStore)).toEqual([snippet])
      expect(get(remoteStore)).toEqual([snippet])
    }
  })

  it('unavailable remote store', async () => {
    dummyExecutorStore.set(createEmptyExecutor())
    {
      const snippet = createNewSnippet()
      await higherSnippetsStore.upsert(snippet)
      expect(get(higherSnippetsStore)).toEqual([snippet])
      expect(get(localStore)).toEqual([snippet])
      expect(get(remoteStore)).toEqual([])
    }
  })
})

describe('higher folders store', () => {
  const handlers = [
    ...createWASqliteMockWASMHandler(),
    ...createRemoteServerURLHandler(),
  ]
  const server = setupServer(...handlers)
  let localStore: LocalFoldersStore
  let remoteStore: RemoteFoldersStore
  let dummyExecutorStore: Writable<SqlitergExecutor>
  let higherFoldersStore: LocalFoldersStore

  beforeAll(async () => {
    server.listen({ onUnhandledRequest: 'error' })

    // local store initialization
    const sqliteAPI = await createSQLiteAPIV2('http://mock.local', 'MemoryVFS')
    const localExecutor = await createQueryExecutor(sqliteAPI, 'crypta', false)
    const localDb = createLocalDb(localExecutor)
    await migrateLocal(
      localExecutor,
      async () => {},
      defaultMigrationQueryMap,
      defaultQueriesStringMap,
    )
    localStore = await createLocalFoldersStore(
      localDb,
      writable('done'),
    )

    // remote store initialization
    const remoteExecutor = createAvailableExecutor()
    dummyExecutorStore = writable(remoteExecutor)
    const remoteDb = createRemoteDb(remoteExecutor)
    await migrateRemote(
      remoteExecutor,
      defaultMigrationQueryMap,
      defaultQueriesStringMap,
    )
    remoteStore = createRemoteFoldersStore(
      dummyExecutorStore,
      writable('done'),
    )
    await waitUntil(remoteStore.isAvailable)
    
    // higher folder store initialization
    higherFoldersStore = createHigherFoldersStore(localStore, remoteStore)
  })

  it('same folders', async () => {
    const localFolders = get(localStore)
    const remoteFolders = get(remoteStore)
    // trigger data merging
    get(higherFoldersStore)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(localFolders).toEqual(remoteFolders)
  });

  it('crud', async () => {
    const newFolder: DisplayFolder = {
      id: 'new-folder',
      name: 'New Folder',
      position: 2,
      updatedAt: new Date().getTime(),
      createdAt: new Date().getTime(),
    }
    await higherFoldersStore.upsert(newFolder)
    await new Promise(resolve => setTimeout(resolve, 100))
    {
      const higherFolders = get(higherFoldersStore)
      expect(higherFolders).toContain(newFolder)
    }
    {
      const localFolders = get(localStore)
      expect(localFolders).toContain(newFolder)
    }
    {
      const remoteFolders = get(remoteStore)
      expect(remoteFolders).toContain(newFolder)
    }

    await higherFoldersStore.delete(newFolder.id)
    {
      const localFolders = get(localStore)
      expect(localFolders).not.toContain(newFolder)
    }
    {
      const remoteFolders = get(remoteStore)
      expect(remoteFolders).not.toContain(newFolder)
    }
  })

  it('unavailable remote store', async () => {
    dummyExecutorStore.set(createEmptyExecutor())
    const newFolder: DisplayFolder = {
      id: 'new-folder',
      name: 'New Folder',
      position: 2,
      updatedAt: new Date().getTime(),
      createdAt: new Date().getTime(),
    }
    await higherFoldersStore.upsert(newFolder)
    await new Promise(resolve => setTimeout(resolve, 100))
    {
      const higherFolders = get(higherFoldersStore)
      expect(higherFolders).toContain(newFolder)
    }
    {
      const localFolders = get(localStore)
      expect(localFolders).toContain(newFolder)
    }
    {
      const remoteFolders = get(remoteStore)
      expect(remoteFolders).not.toContain(newFolder)
    }

    await higherFoldersStore.delete(newFolder.id)
    {
      const localFolders = get(localStore)
      expect(localFolders).not.toContain(newFolder)
    }
  })
})
