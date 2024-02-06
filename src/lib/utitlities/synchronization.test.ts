import { describe, it, expect } from 'vitest'
import { get, writable } from 'svelte/store'
import { createSnippetsDataStateStore } from './synchronization'
import type { Snippet } from './persistence'

function createDummySnippet(id: string, createdAt: number, updatedAt: number): Snippet {
  return {
    id,
    name: 'dummy',
    language: 'dummy',
    text: 'dummy',
    tags: [],
    encrypted: false,
    position: 0,
    createdAt,
    updatedAt,
  }
}

describe('snippets data state store', () => {
  it('empty store', () => {
    const dummyLocalStore = writable<Snippet[]>([])
    const dummyRemoteStore = writable<Snippet[]>([])
    const store = createSnippetsDataStateStore(dummyLocalStore, dummyRemoteStore)
    expect(get(store)).toEqual({})
  })
  it('local only', () => {
    const localStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
    ])
    const remoteStore = writable<Snippet[]>([])
    const store = createSnippetsDataStateStore(localStore, remoteStore)
    expect(get(store)).toEqual({
      'a': 'local-only',
    })
  })
  it('remote only', () => {
    const localStore = writable<Snippet[]>([])
    const remoteStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
    ])
    const store = createSnippetsDataStateStore(localStore, remoteStore)
    expect(get(store)).toEqual({
      'a': 'remote-only',
    })
  })
  it('synchronized', () => {
    const localStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
    ])
    const remoteStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
    ])
    const store = createSnippetsDataStateStore(localStore, remoteStore)
    expect(get(store)).toEqual({
      'a': 'synchronized',
    })
  })
  it('conflicted', () => {
    const localStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
      createDummySnippet('b', 0, 1),
    ])
    const remoteStore = writable<Snippet[]>([
      createDummySnippet('a', 0, 0),
      createDummySnippet('b', 0, 2),
    ])
    const store = createSnippetsDataStateStore(localStore, remoteStore)
    expect(get(store)).toEqual({
      'a': 'synchronized',
      'b': 'conflicted',
    })
  })
})
