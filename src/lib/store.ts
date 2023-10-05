import { writable } from 'svelte/store'

type SectionState = 'public' | 'private'

export const toasterText = writable<string | null>(null)
export const sectionState = writable<SectionState>('public')
