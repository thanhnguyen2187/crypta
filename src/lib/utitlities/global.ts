import { createGlobalStateStore, createSettingsStore, createSettingsV2Store } from '$lib/utitlities/ephemera'

export const globalStateStore = await createGlobalStateStore()
export const settingsStore = await createSettingsStore()
export const settingsV2Store = await createSettingsV2Store()
