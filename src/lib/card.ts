import { writable, derived } from 'svelte/store'
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
}

export const sampleCards: Card[] = [
  {
    id: 'f94f5',
    title: 'Initialize Clojure',
    language: 'shell',
    content: String.raw
`clj -Ttools \
    install com.github.seancorfield/clj-new '{:git/tag "v1.2.399"}' \
    :as clj-new
clj -Tclj-new app \
    :name backend
clojure -Tclj-new \
    create :template \
    template-name :name \
    project-name :args '[arg1 arg2 arg3 ...]'`,
    encrypted: false,
    state: 'default',
  },
  {
    id: '2082c',
    title: 'Build Aptos NixOS',
    language: 'shell',
    content: String.raw
`export PKG_CONFIG_PATH=/nix/store/g8jc4yh3hgvwjp2q420ddgvc3gb2rpkd-openssl-3.0.8-dev/lib/pkgconfig
export LIBCLANG_PATH=/nix/store/y39v6zn19sazv22241by5chfpicfdb2d-clang-11.1.0-lib/lib
export LD_LIBRARY_PATH=/nix/store/xzn56dy54k0sdgm4lx98c20r81hq41nl-openssl-3.0.8/lib
export PATH=$PATH:/home/thanh/.cargo/bin
export PATH=$PATH:/home/thanh/Sources/overmind-xyz/birthday_bot

dotnet tool install ...`,
    encrypted: false,
    state: 'default',
  },
  {
    id: 'a49d4',
    title: 'Sample .tmuxp.yml',
    language: 'yaml',
    content: String.raw
`session_name: dot-phoenix
windows:
  - window_name: editor
    layout: main-horizontal
    options:
      main-pane-height: 32
    panes:
      - shell_command: nvim
      - null
      - null`,
    encrypted: false,
    state: 'default',
  },
  {
    id: 'a49d5',
    title: 'Clojure snippet',
    language: 'clojure',
    content: String.raw`ah3aazgoyHveWLwI.KKnC35uG1OC6DF02tJbqQNR8UYKJ3eS04g2b1HDLZ8kh0pFCZFI=`,
    encrypted: true,
    state: 'default',
  },
]

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
  }
}

export function cardToSnippet(card: Card): Snippet {
  return {
    id: card.id,
    name: card.title,
    text: card.content,
    encrypted: card.encrypted,
    language: card.language,
  }
}
