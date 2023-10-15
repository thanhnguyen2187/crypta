import { writable, derived, get } from 'svelte/store'
import { append, inject, remove, replace } from '$lib/array-manipulation'
import { aesGcmDecrypt, aesGcmEncrypt } from '$lib/encryption';
import type { Snippet } from '$lib/persistence'
import { createSnippetStore } from '$lib/persistence'

export type CardState = 'default' | 'draggedOut' | 'beingHoverOver'
export type Card = {
  id: string
  title: string
  language: string
  content: string
  encrypted: boolean
  state: CardState
  position: number
}

// TODO: card state
const snippetStore = await createSnippetStore()
export const cardStateStore = writable<{[id: string]: CardState}>({})
export const cardStore = derived(
  [snippetStore, cardStateStore],
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

/* Return precisely 6 random characters.
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
  const snippet = cardToSnippet(card)
  await snippetStore.upsert(snippet)
}

export function injectCard(id1: string, id2: string): void {
  cardStore.update(
    (cards: Card[]): Card[] => {
      const index1 = cards.findIndex(card => card.id === id1)
      const index2 = cards.findIndex(card => card.id === id2)
      return inject(cards, index1, index2)
    }
  )
}

export async function addNewCard(card: Card) {
  const snippet = cardToSnippet(card)
  const $cardStore = get(cardStore)
  if ($cardStore.length > 0) {
    snippet.position = $cardStore[$cardStore.length - 1].position + 1
  } else {
    snippet.position = 1
  }
  await snippetStore.upsert(snippet)
}

export async function removeCard(id: string) {
  await snippetStore.remove(id)
}

export function replaceCard(id: string, card: Card): void {
  cardStore.update(
    (cards: Card[]): Card[] => {
      const index = cards.findIndex(card => card.id === id)
      cards[index] = card
      return cards
    }
  )
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
  }
}
