import { writable } from 'svelte/store'

type SectionState = 'public' | 'private'

export const sectionState = writable<SectionState>('public')

export function nextSectionState(state: SectionState): SectionState {
  switch (state) {
    case 'public':
      return 'private'
    case 'private':
      return 'public'
    default:
      throw new Error(`nextSectionState: invalid state: ${state}`)
  }
}

export function setSectionState(state: SectionState) {
  sectionState.set(state)
}
