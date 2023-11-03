export type SyncState = 'conflicted' | 'synchronized' | 'localOnly'
export type DataState = {
  [id: string]: {
    localRecord: {}
    remoteRecord: {}
    syncState: SyncState
  }
}
