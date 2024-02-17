import type { Readable } from 'svelte/store'
import { aesGcmDecrypt, aesGcmEncrypt } from '$lib/utitlities/encryption'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import { folders, snippet_tags, snippets } from '$lib/sqlite/schema'
import { sql } from 'drizzle-orm'
import type { MigrationState } from '$lib/sqlite/migration'
import type { DisplayFolder } from '$lib/utitlities/data-transformation';

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

export type SnippetStore =
  Readable<Snippet[]> &
  {
    clone(snippet: Snippet): Promise<void>
    upsert(snippet: Snippet): Promise<void>
    remove(id: string): Promise<void>
    move(movingSnippet: Snippet, sourceFolderId: string, destinationFolderId: string): Promise<void>
    clearAll(): Promise<void>
    migrationStateStore: Readable<MigrationState>
  }

export async function readCatalog(): Promise<Catalog> {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('catalog.json', {create: true})
  const file = await fileHandle.getFile()
  const text = await file.text()
  const savedCatalog = text ? JSON.parse(text) : {}

  // use default catalog if the file is not found
  return Object.assign(
    {},
    defaultCatalog,
    savedCatalog,
  )
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

export async function v0DataImport(db: SqliteRemoteDatabase) {
  const catalog = await readCatalog()
  const folderRecords = Object.entries(catalog).map(
    ([folderId, folder], index) => {
      return {
        id: folderId,
        name: folder.displayName,
        position: index,
      }
    }
  )
  for (const record of folderRecords) {
    await db
    .insert(folders)
    .values(record)
    .onConflictDoNothing()
  }

  for (const folderRecord of folderRecords) {
    const snippetRecords = await readSnippets(folderRecord.id)
    for (const snippetRecord of snippetRecords) {
      await db
      .insert(snippets)
      .values({
        ...snippetRecord,
        folderId: folderRecord.id,
        // We need to divide by 1000 since JavaScript's timestamp is in
        // nanosecond instead of millisecond.
        createdAt: sql`DATETIME(${(snippetRecord.createdAt / 1000).toFixed()}, 'unixepoch')`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .onConflictDoNothing()

      for (const tag of snippetRecord.tags) {
        await db
        .insert(snippet_tags)
        .values({
          snippetId: snippetRecord.id,
          tagText: tag,
        })
        .onConflictDoNothing()
      }
    }
  }
}

export type LocalFoldersStore = Readable<DisplayFolder[]> &
  {
    upsert: (folder: DisplayFolder) => Promise<void>
    delete: (id: string) => Promise<void>
  }

export type RemoteFoldersStore =
  LocalFoldersStore &
  {
    isAvailable(): Promise<boolean>
    refresh(): Promise<void>
  }

