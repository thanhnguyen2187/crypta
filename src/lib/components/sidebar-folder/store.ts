import { derived, writable } from 'svelte/store'
import type { Readable, Writable } from 'svelte/store'
import { defaultCatalog, readCatalog, writeCatalog } from '$lib/utitlities/persistence'
import type { Catalog, Folder } from '$lib/utitlities/persistence'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { folders as folders_table } from '$lib/sqlite/schema'
import { deleteFolder, queryFolders, upsertFolder } from '$lib/sqlite/queries';
import { localDb } from '$lib/sqlite/global';
import type { MigrationState } from '$lib/sqlite/migration';
import { migrationStateStore } from '$lib/sqlite/migration';

export type CatalogStore = Readable<Catalog> &
  {
    upsert: (folder: Folder) => void
    delete: (id: string) => void
    setDisplayName: (id: string, displayName: string) => void
    setShowLockedCard: (id: string, showLockedCard: boolean) => void
  }

export type DisplayFolder = {
  id: string
  name: string
  position: number
}
export type FoldersStoreV2 = Readable<DisplayFolder[]> &
  {
    upsert: (folder: DisplayFolder) => Promise<void>
    delete: (id: string) => Promise<void>
  }

export async function createCatalogStore(): Promise<CatalogStore> {
  const catalog = await readCatalog()
  const store = writable(catalog)
  const {update, subscribe, set} = store

  return {
    subscribe,
    upsert: (folder: Folder) => {
      catalog[folder.id] = folder
      writeCatalog(catalog)
      set(catalog)
    },
    delete: (id: string) => {
      delete catalog[id]
      writeCatalog(catalog)
      set(catalog)
    },
    setDisplayName: (id: string, displayName: string) => {
      catalog[id].displayName = displayName
      writeCatalog(catalog)
      set(catalog)
    },
    setShowLockedCard: (id: string, showLockedCard: boolean) => {
      catalog[id].showLockedCard = showLockedCard
      writeCatalog(catalog)
      set(catalog)
    },
  }
}

export async function createFoldersStoreV2(db: SqliteRemoteDatabase, migrationStateStore: Writable<MigrationState>): Promise<FoldersStoreV2> {
  let displayFolders: DisplayFolder[] = []
  const {subscribe, set} = writable(displayFolders)
  migrationStateStore.subscribe(
    async (migrationState) => {
      if (migrationState === 'done') {
        const folders = await queryFolders(db)
        displayFolders = folders.map(
          dbFolder => ({
            id: dbFolder.id,
            name: dbFolder.name,
            position: dbFolder.position,
          })
        )
        set(displayFolders)
      }
    }
  )

  return {
    subscribe,
    async upsert(folder: DisplayFolder) {
      await upsertFolder(db, folder)
      const index = displayFolders.findIndex(folder_ => folder_.id === folder.id)
      if (index === -1) {
        displayFolders.push(folder)
        set(displayFolders)
      }

      displayFolders[index] = folder
      set(displayFolders)
    },
    async delete(id: string) {
      await deleteFolder(db, id)
      const index = displayFolders.findIndex(folder => folder.id === id)
      displayFolders.splice(index, 1)

      set(displayFolders)
    }
  }
}

export const catalogStore = await createCatalogStore()
export const foldersStore = derived(
  catalogStore,
  (catalog: Catalog) => {
    return Object.entries(catalog).map(
      ([id, data]) => {
        return {
          id: id,
          displayName: data.displayName,
        }
      }
    )
  }
)
export const foldersStoreV2 = await createFoldersStoreV2(localDb, migrationStateStore)

