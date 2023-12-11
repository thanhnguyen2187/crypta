import { derived, writable } from 'svelte/store'
import { readCatalog, writeCatalog } from '$lib/utitlities/persistence'
import type { Catalog, Folder } from '$lib/utitlities/persistence'

export async function createCatalogStore() {
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
