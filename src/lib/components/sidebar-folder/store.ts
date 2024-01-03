import { writable } from 'svelte/store'
import type { Readable, Writable } from 'svelte/store'
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import { deleteFolder, queryFolders, upsertFolder } from '$lib/sqlite/queries'
import { localDb } from '$lib/sqlite/global'
import type { MigrationState } from '$lib/sqlite/migration'
import { migrationStateStore } from '$lib/sqlite/migration'

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

export const foldersStoreV2 = await createFoldersStoreV2(localDb, migrationStateStore)
