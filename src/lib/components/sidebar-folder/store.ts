import { higherSnippetsStore, localDb } from '$lib/sqlite/global'
import { createLocalFoldersStore } from '$lib/sqlite/wa-sqlite'

export const localFoldersStore = await createLocalFoldersStore(localDb, higherSnippetsStore.migrationStateStore)
