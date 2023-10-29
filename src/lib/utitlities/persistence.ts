import { writable } from 'svelte/store'

export type Snippet = {
  id: string
  name: string
  language: string
  text: string
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

function generateFolderName(folderName: string): string {
  return `crypta.${folderName}`
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

export async function createSnippetStore() {
  const snippets = await readSnippets()
  const store = writable(snippets)
  const {subscribe, set, update} = store

  return {
    subscribe,
    upsert: async (snippet: Snippet) => {
      await persistSnippet(snippet)
      update(
        snippets => {
          const index = snippets.findIndex(snippet_ => snippet_.id === snippet.id)
          if (index !== -1) {
            snippets[index] = snippet
          } else {
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
