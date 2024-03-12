import { createGlobalStateStore, createSettingsStore } from '$lib/utitlities/ephemera'

export const globalStateStore = await createGlobalStateStore()
export const settingsStore = await createSettingsStore()
