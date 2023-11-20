import { derived, get, writable } from 'svelte/store'
import { dialogSettingsStateStore, dialogSettingsStore, dialogStateStore } from '$lib/components/dialog/dialog'

export type SyncState = 'conflicted' | 'synchronized' | 'localOnly'
export type DataState = {
  [id: string]: {
    localRecord: {}
    remoteRecord: {}
    syncState: SyncState
  }
}

export async function createRemoteSnippetStore() {
  const settings = get(dialogSettingsStore)
  const endpoint = `${settings.serverURL}/api/v1/snippets`

  const store = derived(
    dialogSettingsStateStore,
    async (settingsStatePromise) => {
      const settingsState = await settingsStatePromise
      if (settingsState !== 'connected') {
        return []
      }

      return await fetch(endpoint)
    },
  )

  return store
}
