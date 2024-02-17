import { higherSnippetsStore, localDb } from '$lib/sqlite/global'

import { createFoldersStoreV2 } from '$lib/utitlities/persistence';

export const localFoldersStore = await createFoldersStoreV2(localDb, higherSnippetsStore.migrationStateStore)
