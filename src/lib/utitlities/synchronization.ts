import { derived, get, writable } from 'svelte/store'
import { dialogSettingsStateStore, dialogSettingsStore, dialogStateStore } from '$lib/components/dialog/dialog'
import type { Settings, Snippet } from '$lib/utitlities/persistence';

export type SyncState = 'conflicted' | 'synchronized' | 'localOnly'
export type DataState = {
  [id: string]: {
    localRecord: {}
    remoteRecord: {}
    syncState: SyncState
  }
}

export const remoteSnippetStore = createRemoteSnippetStore()

async function fetchRemoteSnippets(settings: Settings) {
  const endpoint = `${settings.serverURL}/api/v1/snippets`
  const encodedAuthorization = Buffer.from(`${settings.username}:${settings.password}`).toString('base64')
  const response = await fetch(
    endpoint,
    {
      headers: {
        Authorization: `Basic ${encodedAuthorization}`
      },
    },
  )
  if (response.status !== 200) {
    // should log or find some way to indicate that there was a problem
    return []
  }

  const responseJson = await response.json()
  return responseJson.data
}

export function createRemoteSnippetStore() {
  const store = writable([])
  const {set, update, subscribe} = store

  dialogSettingsStateStore.subscribe(
    async (state) => {
      if (state !== 'connected') {
        set([])
        return
      }

      const settings = get(dialogSettingsStore)
      const records = await fetchRemoteSnippets(settings)

      set(records)
    }
  )

  return {
    subscribe,
  }
}
