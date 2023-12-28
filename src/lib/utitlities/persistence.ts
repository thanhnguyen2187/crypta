import { derived, writable } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'
import { aesGcmDecrypt, aesGcmEncrypt } from '$lib/utitlities/encryption'
import { globalFolderIdStore, globalStateStore } from '$lib/utitlities/ephemera'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import { snippet_tags, snippets as table_snippets } from '$lib/sqlite/schema'
import { sql } from 'drizzle-orm'
import type { MigrationState } from '$lib/sqlite/migration'

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
  let folderId: string = 'default'
  const store = writable(snippets)
  const {subscribe, set, update} = store
  const pairStore = derived(
    [migrationStateStore, globalStateStore],
    ([migrationState, globalState]) => {
      return [migrationState, globalState]
    }
  )
  pairStore.subscribe(
    async ([migrationState, globalState]) => {
      if (migrationState === 'done') {
        const dbSnippets = await
          db
          .select()
          .from(table_snippets)
          .where(sql`folder_id = ${globalState.folderId}`)
        const tags = await
          db
          .select()
          .from(snippet_tags)
          .where(sql`snippet_id IN ${dbSnippets.map(dbSnippet => dbSnippet.id)}`)
        const tagsMap: {[id: string]: string[]} = {}
        for (const tag of tags) {
          if (tagsMap[tag.snippetId]) {
            tagsMap[tag.snippetId].push(tag.tagText)
          } else {
            tagsMap[tag.snippetId] = [tag.tagText]
          }
        }
        const snippets: Snippet[] = dbSnippets.map(
          (dbSnippet) => {
            return {
              id: dbSnippet.id,
              name: dbSnippet.name,
              language: dbSnippet.language,
              text: dbSnippet.text,
              position: dbSnippet.position,
              encrypted: dbSnippet.encrypted,
              tags: tagsMap[dbSnippet.id] ?? [],
              createdAt: 0,
              updatedAt: 0,
            }
          }
        )
        store.set(snippets)
      }
    }
  )

  return {
    subscribe,
    clone: async (snippet: Snippet) => {},
    upsert: async (snippet: Snippet) => {},
    remove: async (id: string) => {},
    move: async (movingSnippet: Snippet, sourceFolderId: string, destinationFolderId: string) => {},
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
