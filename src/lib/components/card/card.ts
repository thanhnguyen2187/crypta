import { writable, derived, get } from 'svelte/store'
import { aesGcmDecrypt, aesGcmEncrypt } from '$lib/utitlities/encryption';
import type { Snippet } from '$lib/utitlities/persistence'
import { createLocalSnippetStore } from '$lib/utitlities/persistence'
import { compareSnippets, remoteSnippetStore } from '$lib/utitlities/synchronization'
import type { DataState } from '$lib/utitlities/synchronization'

export type CardState = 'default' | 'draggedOut' | 'beingHoverOver'
export type Card = {
  id: string
  title: string
  language: string
  content: string
  encrypted: boolean
  state: CardState
  position: number
  createdAt: number
  updatedAt: number
}

const localSnippetStore = await createLocalSnippetStore()

const allSnippetsStore = derived(
  [localSnippetStore, remoteSnippetStore],
  ([localSnippets, remoteSnippets]) => {
    return [
      ...localSnippets,
      ...remoteSnippets,
    ]
  }
)

export const dataStateStore = derived(
  [localSnippetStore, remoteSnippetStore],
  ([localSnippets, remoteSnippets]) => {
    const dataState: DataState = {}
    debugger
    for (const localSnippet of localSnippets) {
      dataState[localSnippet.id] = {
        localRecord: localSnippet,
        syncState: 'localOnly',
      }
    }
    for (const remoteSnippet of remoteSnippets) {
      dataState[remoteSnippet.id] = {
        syncState: 'remoteOnly',
        remoteRecord: remoteSnippet,
      }
    }

    for (const [id, holder] of Object.entries(dataState)) {
      dataState[id].syncState = compareSnippets(holder.localRecord, holder.remoteRecord)
    }
    return dataState
  }
)

export const cardStateStore = writable<{[id: string]: CardState}>({})
export const cardStore = derived(
  [allSnippetsStore, cardStateStore],
  (([snippets, cardStates]) => {
    return snippets.map(
      snippet => ({
        ...snippetToCard(snippet),
        state: cardStates[snippet.id] ?? 'default',
      })
    ).sort(
      (a, b) => {
        if (a.position > b.position) {
          return 1
        } else if (a.position < b.position) {
          return -1
        }
        return 0
      }
    )
  })
)
export const unlockedCardStore = derived(cardStore, ($cardStore) => $cardStore.filter(card => !card.encrypted))
export const lockedCardStore = derived(cardStore, ($cardStore) => $cardStore.filter(card => card.encrypted))

/** Return precisely 6 random characters.
 * */
function generateId(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function newEmptyCard(): Card {
  return {
    id: generateId(),
    title: 'Untitled',
    language: 'plaintext',
    content: '',
    encrypted: false,
    state: 'default',
    position: 0,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  }
}

export function duplicateCard(card: Card) {
  return {
    ...card,
    id: generateId(),
  }
}

export function updateCardState(id: string, state: CardState): void {
  cardStateStore.update(
    cardStates => {
      cardStates[id] = state
      return cardStates
    }
  )
}

export async function updateCard(card: Card) {
  card.updatedAt = new Date().getTime()
  const snippet = cardToSnippet(card)
  await localSnippetStore.upsert(snippet)
}

/**
 * Move one card (moving) to be behind another (pivot). Update the cards
 * position to reflect the change.
 * */
export async function injectCard(movingId: string, pivotId: string) {
  if (movingId === pivotId) {
    return
  }

  const snippets = get(localSnippetStore)
  const movingSnippet = snippets.find(snippet => snippet.id === movingId)
  if (!movingSnippet) {
    return
  }

  const pivotSnippet = snippets.find(snippet => snippet.id === pivotId)
  if (!pivotSnippet) {
    return
  }

  let previousPivotPosition = Number.NEGATIVE_INFINITY
  for (const snippet of snippets) {
    if (snippet.position < pivotSnippet.position) {
      previousPivotPosition = Math.max(previousPivotPosition, snippet.position)
    }
  }

  // handle edge case where the moving card is "right behind" the pivot card
  if (previousPivotPosition === movingSnippet.position) {
    [
      movingSnippet.position,
      pivotSnippet.position
    ] = [
      pivotSnippet.position,
      movingSnippet.position,
    ]
    await localSnippetStore.upsert(movingSnippet)
    await localSnippetStore.upsert(pivotSnippet)
    return
  }

  if (previousPivotPosition === Number.NEGATIVE_INFINITY) {
    movingSnippet.position = pivotSnippet.position - 1
  } else {
    movingSnippet.position = (previousPivotPosition + pivotSnippet.position) / 2
  }
  await localSnippetStore.upsert(movingSnippet)
}

export async function addNewCard(card: Card) {
  const snippet = cardToSnippet(card)
  const $cardStore = get(cardStore)
  if ($cardStore.length > 0) {
    snippet.position = $cardStore[$cardStore.length - 1].position + 1
  } else {
    snippet.position = 1
  }
  await localSnippetStore.upsert(snippet)
}

export async function removeCard(id: string) {
  await localSnippetStore.remove(id)
}

export async function replaceCard(id: string, card: Card) {
  const snippet = cardToSnippet(card)
  await localSnippetStore.upsert(snippet)
}

export async function toLockedCard(card: Card, password: string): Promise<Card> {
  return {
    ...card,
    content: await aesGcmEncrypt(card.content, password),
    encrypted: true,
  }
}

export async function toUnlockedCard(card: Card, password: string): Promise<Card> {
  return {
    ...card,
    content: await aesGcmDecrypt(card.content, password),
    encrypted: true,
  }
}

export function snippetToCard(snippet: Snippet): Card {
  return {
    id: snippet.id,
    title: snippet.name,
    language: snippet.language,
    content: snippet.text,
    encrypted: snippet.encrypted,
    state: 'default',
    position: snippet.position,
    createdAt: snippet.createdAt,
    updatedAt: snippet.updatedAt,
  }
}

export function cardToSnippet(card: Card): Snippet {
  return {
    id: card.id,
    name: card.title,
    text: card.content,
    encrypted: card.encrypted,
    language: card.language,
    position: card.position,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  }
}