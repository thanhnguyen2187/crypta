import { writable } from 'svelte/store'
import { aesGcmDecrypt, aesGcmEncrypt } from '$lib/utitlities/encryption'

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

export type Settings = {
  serverURL: string
  username: string
  password: string
}

export const defaultSettings: Settings = {
  serverURL: '',
  username: '',
  password: '',
}

export type Catalog = {
  [folderName: string]: {
    displayName: string
    showLockedCard: boolean
    position: number
  }
}

export const defaultCatalog: Catalog = {
  default: {
    displayName: 'Default',
    showLockedCard: true,
    position: 0,
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


export async function createLocalSnippetStore() {
  const snippets = await readSnippets()
  const store = writable(snippets)
  const {subscribe, set, update} = store

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
      await persistSnippet(newSnippet)
      update(
        snippets => {
          snippets.push(newSnippet)
          return snippets
        }
      )
    },
    upsert: async (snippet: Snippet) => {
      await persistSnippet(snippet)
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
      await deleteSnippet(id)
      update(
        snippets => {
          const index = snippets.findIndex(snippet => snippet.id === id)
          if (index !== -1) {
            snippets.splice(index, 1)
          }
          return snippets
        }
      )
    }
  }
}

export async function readSettings() {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('settings.json', {create: true})
  const file = await fileHandle.getFile()
  const text = await file.text()
  const savedSettings = text ? JSON.parse(text) : {}

  // use default settings if no settings are found
  return Object.assign(
    {},
    defaultSettings,
    savedSettings,
  )
}

export async function writeSettings(settings: Settings) {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('settings.json', {create: true})
  const writeable = await fileHandle.createWritable()
  await writeable.write(JSON.stringify(settings))
  await writeable.close()
}

export async function readCatalog(): Promise<Catalog> {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('catalog.json', {create: true})
  const file = await fileHandle.getFile()
  const text = await file.text()
  const savedSettings = text ? JSON.parse(text) : {}

  // use default catalog if the file is found
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
