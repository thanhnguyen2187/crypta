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

const remoteSnippetStore = derived(
  dialogSettingsStateStore,
  async (connectionState) => {
    if (connectionState !== 'connected') {
      return []
    }

    const settings = get(dialogSettingsStore)
    const endpoint = `${settings.serverURL}/api/v1/snippets`
    const response = await fetch(endpoint)
    if (response.status !== 200) {
      // should log or find some way to indicate that there was a problem
      return []
    }

    const responseJson = await response.json()
    return responseJson.data
  }
)
