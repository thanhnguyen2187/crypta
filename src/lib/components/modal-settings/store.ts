import { writable } from 'svelte/store'
import { readCatalog, writeCatalog } from '$lib/utitlities/persistence'

export async function createCatalogStore() {
  const catalog = await readCatalog()
  const store = writable(catalog)
  const {update, subscribe, set} = store

  return {
    subscribe,
    setDisplayName: (folderName: string, displayName: string) => {
      catalog[folderName].displayName = displayName
      writeCatalog(catalog)
      set(catalog)
    },
    setShowLockedCard: (folderName: string, showLockedCard: boolean) => {
      catalog[folderName].showLockedCard = showLockedCard
      writeCatalog(catalog)
      set(catalog)
    },
  }
}
export const catalogStore = await createCatalogStore()
