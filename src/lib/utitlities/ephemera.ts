import { writable } from 'svelte/store'
import type { Writable, Updater } from 'svelte/store'
import { readGlobalState, writeGlobalState } from '$lib/utitlities/persistence'
import type { GlobalState } from '$lib/utitlities/persistence'

export type GlobalStateStore =
  Writable<GlobalState> &
  {
    addTag: (tag: string) => void
    removeTag: (tag: string) => void
    setSearchInput: (input: string) => void
    setFolderId: (folderId: string) => void
  }

export type Settings = {
  serverURL: string
  username: string
  password: string
}

export type SettingsStore = Writable<Settings>

export async function readSettings(): Promise<Settings> {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('settings.json', {create: true})
  const file = await fileHandle.getFile()
  const text = await file.text()
  const savedSettings = text ? JSON.parse(text) : {}

  return Object.assign(
    {},
    {
      serverURL: '',
      username: '',
      password: '',
    },
    savedSettings,
  )
}

export async function writeSettings(settings: Settings) {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('settings.json', {create: true})
  const writable = await fileHandle.createWritable()
  await writable.write(JSON.stringify(settings))
  await writable.close()
}

export async function createSettingsStore(): Promise<SettingsStore> {
  let settings = await readSettings()
  const store = writable(settings)

  return {
    subscribe: store.subscribe,
    set(value: Settings) {
      settings = value
      writeSettings(settings).then()
      store.set(value)
    },
    update(updater: Updater<Settings>) {
      settings = updater(settings)
      writeSettings(settings).then()
      store.update(updater)
    },
  }
}

export async function createGlobalStateStore(): Promise<GlobalStateStore> {
  const state = await readGlobalState()
  const tags: Set<string> = new Set(state.tags)
  const store = writable(state)

  return {
    subscribe: store.subscribe,
    set(value: GlobalState) {
      writeGlobalState(value).then()
      store.set(value)
    },
    update(updater: Updater<GlobalState>) {
      const value = updater(state)
      writeGlobalState(value).then()
      store.set(value)
    },
    addTag: (tag: string) => {
      tags.add(tag)
      state.tags = Array.from(tags)
      writeGlobalState(state).then()
      store.set(state)
    },
    removeTag: (tag: string) => {
      tags.delete(tag)
      state.tags = Array.from(tags)
      writeGlobalState(state).then()
      store.set(state)
    },
    setSearchInput: (input: string) => {
      state.searchInput = input
      writeGlobalState(state).then()
      store.set(state)
    },
    setFolderId: (folderId: string) => {
      state.folderId = folderId
      writeGlobalState(state).then()
      store.set(state)
    },
  }
}

export const globalStateStore = await createGlobalStateStore()
export const settingsStore = await createSettingsStore()
