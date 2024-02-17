import { higherSnippetsStore, localDb } from '$lib/sqlite/global'

import { createLocalFoldersStore } from '$lib/utitlities/persistence';

export const localFoldersStore = await createLocalFoldersStore(localDb, higherSnippetsStore.migrationStateStore)
