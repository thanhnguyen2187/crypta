import { derived, writable } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'
import { aesGcmDecrypt, aesGcmEncrypt } from '$lib/utitlities/encryption'
import { globalFolderIdStore, globalStateStore } from '$lib/utitlities/ephemera'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import { snippet_tags, snippets as table_snippets } from '$lib/sqlite/schema'
import { sql } from 'drizzle-orm'
import type { MigrationState } from '$lib/sqlite/migration'
import {
  querySnippetsByFolderId,
  queryTagsBySnippetIds,
  upsertSnippet,
  deleteSnippet as deleteSnippet_, upsertTags, clearTags,
} from '$lib/sqlite/queries';
import {
  buildTagsMap,
  dbSnippetToDisplaySnippet,
  displaySnippetToDbSnippet
} from '$lib/utitlities/data-transformation';

export type Snippet = {
  id: string
  name: string
  language: string
  text: string
  tags: string[]
  encrypted: boolean
  position: number
  updatedAt: number
  createdAt: number
}

export type Catalog = {
  [id: string]: Folder
}

export type Folder = {
  id: string
  displayName: string
  position: number
  showLockedCard: boolean
  updatedAt: number
  createdAt: number
}

export type GlobalState = {
  folderId: string
  tags: string[]
  searchInput: string
}

export const defaultCatalog: Catalog = {
  default: {
    id: 'default',
    displayName: 'Default',
    showLockedCard: true,
    position: 0,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  }
}

export const defaultGlobalState: GlobalState = {
  folderId: 'default',
  tags: [],
  searchInput: '',
}

function generateFolderName(folderName: string): string {
  return `folder.${folderName}`
}

/**
 * Read all persisted snippets, with OPFS as the underlying engine. The
 * assumption is that snippet's `id` is the file name, and the snippet itself is
 * JSONified.
 *
 * @param folderName is used to group the snippets; is defaulted for now since
 * the frontend implementation is not there yet.
 * */
export async function readSnippets(folderName: string = 'default'): Promise<Snippet[]> {
  const opfsRoot = await navigator.storage.getDirectory()
  const folderHandle = await opfsRoot.getDirectoryHandle(
    generateFolderName(folderName),
    {create: true},
  )
  const snippets = []
  for await (let [name, handle] of folderHandle) {
    if (handle.kind === 'file') {
      const file = await handle.getFile()
      const text = await file.text()
      const snippet = {
        id: name.replace('.json', ''),
        ...JSON.parse(text)
      }
      snippets.push(snippet)
    }
  }

  return snippets as Snippet[]
}

/**
 * Make sure that the snippet's data is available after restart. Snippet's `id`
 * is used as the unique key.
 * */
export async function persistSnippet(snippet: Snippet, folderName: string = 'default') {
  const opfsRoot = await navigator.storage.getDirectory()
  const folderHandle = await opfsRoot.getDirectoryHandle(
    generateFolderName(folderName),
    {create: true},
  )
  const fileHandle = await folderHandle.getFileHandle(`${snippet.id}.json`, {create: true})
  const writable = await fileHandle.createWritable()
  await writable.write(JSON.stringify(snippet))
  await writable.close()
}

/**
 * Delete the snippet's data completely.
 * */
export async function deleteSnippet(id: string, folderName: string = 'default') {
  const opfsRoot = await navigator.storage.getDirectory()
  const folderHandle = await opfsRoot.getDirectoryHandle(
    generateFolderName(folderName),
    {create: true},
  )
  await folderHandle.removeEntry(`${id}.json`)
}

export function createNewSnippet(): Snippet {
  return {
    id: crypto.randomUUID(),
    name: 'Untitled',
    language: 'plaintext',
    text: 'To be filled',
    tags: [],
    encrypted: false,
    position: 0,
    updatedAt: new Date().getTime(),
    createdAt: new Date().getTime(),
  }
}

export async function encryptSnippet(oldSnippet: Snippet, password: string): Promise<Snippet> {
  return {
    ...oldSnippet,
    encrypted: true,
    text: await aesGcmEncrypt(oldSnippet.text, password),
    updatedAt: new Date().getTime(),
  }
}

export async function decryptSnippet(oldSnippet: Snippet, password: string): Promise<Snippet> {
  return {
    ...oldSnippet,
    encrypted: false,
    text: await aesGcmDecrypt(oldSnippet.text, password),
    updatedAt: new Date().getTime(),
  }
}

export type SnippetStore = Readable<Snippet[]> &
  {
    clone: (snippet: Snippet) => Promise<void>
    upsert: (snippet: Snippet) => Promise<void>
    remove: (id: string) => Promise<void>
    move: (movingSnippet: Snippet, sourceFolderId: string, destinationFolderId: string) => Promise<void>
  }

export async function createLocalSnippetStore(): Promise<SnippetStore> {
  let snippets: Snippet[] = []
  let folderId: string = 'default'
  const store = writable(snippets)
  const {subscribe, set, update} = store
  globalStateStore.subscribe(
    async (state) => {
      snippets = await readSnippets(state.folderId)
      folderId = state.folderId
      set(snippets)
    }
  )

  return {
    subscribe,
    clone: async (snippet: Snippet) => {
      const newSnippet: Snippet = {
        ...snippet,
        id: crypto.randomUUID(),
        position: snippets.length + 1,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }
      await persistSnippet(newSnippet, folderId)
      update(
        snippets => {
          snippets.push(newSnippet)
          return snippets
        }
      )
    },
    upsert: async (snippet: Snippet) => {
      await persistSnippet(snippet, folderId)
      update(
        snippets => {
          const index = snippets.findIndex(snippet_ => snippet_.id === snippet.id)
          if (index !== -1) {
            snippets[index] = snippet
          } else {
            snippet.position = snippets.length + 1
            snippets.push(snippet)
          }
          return snippets
        }
      )
    },
    remove: async (id: string) => {
      await deleteSnippet(id, folderId)
      update(
        snippets => {
          const index = snippets.findIndex(snippet => snippet.id === id)
          if (index !== -1) {
            snippets.splice(index, 1)
          }
          return snippets
        }
      )
    },
    move: async (movingSnippet: Snippet, sourceFolderId: string, destinationFolderId: string) => {
      await deleteSnippet(movingSnippet.id, sourceFolderId)
      movingSnippet.updatedAt = new Date().getTime()
      await persistSnippet(movingSnippet, destinationFolderId)
      const index = snippets.findIndex(snippet => snippet.id === movingSnippet.id)
      if (index !== -1) {
        snippets.splice(index, 1)
      }
      set(snippets)
    },
  }
}

export async function createLocalSnippetStoreV2(migrationStateStore: Writable<MigrationState>, db: SqliteRemoteDatabase): Promise<SnippetStore> {
  let snippets: Snippet[] = []
  let folderId = 'default'
  const store = writable(snippets)
  const {subscribe, set, update} = store
  const stores = derived(
    [globalStateStore, migrationStateStore],
    ([globalState, migrationState]: [GlobalState, MigrationState]) => {
      folderId = globalState.folderId
      return [globalState, migrationState]
    }
  )
  stores.subscribe(
    // TODO: fix the typing of `globalState` and `migrationState`, which both
    //       have the type `GlobalState | MigrationState`
    async ([globalState, migrationState]) => {
      if (migrationState === 'done') {
        const dbSnippets = await querySnippetsByFolderId(db, folderId)
        const snippetIds = dbSnippets.map(snippet => snippet.id)
        const tags = await queryTagsBySnippetIds(db, snippetIds)
        const tagsMap = buildTagsMap(tags)
        snippets = dbSnippets.map(
          (dbSnippet) => dbSnippetToDisplaySnippet(dbSnippet, tagsMap)
        )
        store.set(snippets)
      }
    }
  )

  return {
    subscribe,
    clone: async (snippet: Snippet) => {
      const clonedSnippet: Snippet = {
        ...snippet,
        id: crypto.randomUUID(),
        position: snippets.length + 1,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }
      const dbSnippet = displaySnippetToDbSnippet(folderId, clonedSnippet)
      await upsertSnippet(db, dbSnippet)
      if (snippet.tags.length > 0) {
        await upsertTags(db, clonedSnippet.id, snippet.tags)
      }
      snippets.push(clonedSnippet)

      set(snippets)
    },
    upsert: async (snippet: Snippet) => {
      const dbSnippet = displaySnippetToDbSnippet(folderId, snippet)
      await upsertSnippet(db, dbSnippet)
      if (snippet.tags && snippet.tags.length > 0) {
        await clearTags(db, snippet.id)
        await upsertTags(db, snippet.id, snippet.tags)
      }
      const index = snippets.findIndex(snippet_ => snippet_.id === snippet.id)
      if (index === -1) {
        snippets.push(snippet)
        set(snippets)
        return
      }

      snippets[index] = snippet
      set(snippets)
    },
    remove: async (id: string) => {
      await deleteSnippet_(db, id)
      const index = snippets.findIndex(snippet => snippet.id === id)
      snippets.splice(index, 1)

      set(snippets)
    },
    move: async (movingSnippet: Snippet, sourceFolderId: string, destinationFolderId: string) => {
      const dbSnippet = displaySnippetToDbSnippet(sourceFolderId, movingSnippet)
      dbSnippet.folderId = destinationFolderId
      await upsertSnippet(db, dbSnippet)

      const index = snippets.findIndex(snippet => snippet.id === movingSnippet.id)
      snippets.splice(index, 1)

      set(snippets)
    },
  }
}

export async function readCatalog(): Promise<Catalog> {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('catalog.json', {create: true})
  const file = await fileHandle.getFile()
  const text = await file.text()
  const savedSettings = text ? JSON.parse(text) : {}

  // use default catalog if the file is not found
  return Object.assign(
    {},
    defaultCatalog,
    savedSettings,
  )
}

export async function writeCatalog(catalog: Catalog) {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('catalog.json', {create: true})
  const writeable = await fileHandle.createWritable()
  await writeable.write(JSON.stringify(catalog))
  await writeable.close()
}

export function createNewFolder(): Folder {
  return {
    id: crypto.randomUUID(),
    displayName: 'Untitled',
    showLockedCard: true,
    position: 0,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  }
}

export async function readGlobalState(): Promise<GlobalState> {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('globalState.json', {create: true})
  const file = await fileHandle.getFile()
  const text = await file.text()
  const savedState = text ? JSON.parse(text) : {}

  // use default global state if the file is not found
  return Object.assign(
    {},
    {
      folderId: 'default',
      tags: [],
      searchInput: '',
    },
    savedState,
  )
}

export async function writeGlobalState(state: GlobalState) {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('globalState.json', {create: true})
  const writeable = await fileHandle.createWritable()
  await writeable.write(JSON.stringify(state))
  await writeable.close()
}
