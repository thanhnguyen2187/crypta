<script lang="ts">
  import Card from '../card/card.svelte'
  import CardPlaceHolding from '../card/card-placeholding.svelte'
  import {
    addNewCard,
    duplicateCard,
    updateCardState,
    unlockedCardStore,
    removeCard,
    replaceCard,
    toLockedCard
  } from '../card/card.ts'
  import autoAnimate from '@formkit/auto-animate'
  import { injectCard, newEmptyCard } from '../card/card.ts'
  import { dialogActionStore, dialogStateStore, dialogPasswordStore } from '../dialog/dialog'

  let draggedId = ''
  let dropped = true

  async function handleNewPaste(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'v') {
      const text = await navigator.clipboard.readText()
      const card = newEmptyCard()
      card.content = text
      await addNewCard(card)
    }
  }
</script>

<div
  class="mx-auto my-4 grid grid-cols-4 gap-4 justify-items-center content-start"
  use:autoAnimate
  tabindex="-1"
  on:keydown={handleNewPaste}
>
  {#each $unlockedCardStore as card, index (card.id)}
    <div
      draggable="true"
      class="cursor-grab"
      on:dragstart={() => {
        draggedId = card.id
        dropped = false
        updateCardState(draggedId, 'draggedOut')
      }}
      on:dragover|preventDefault={() => {}}
      on:dragend={() => {
        if (!dropped) {
          updateCardState(draggedId, 'default')
          dropped = true
        }
      }}
      on:drop={async () => {
        dropped = true
        updateCardState(draggedId, 'default')
        await injectCard(draggedId, card.id)
      }}
    >
      <Card
        card="{card}"
        removalCallback="{async () => {
          await removeCard(card.id)
        }}"
        lockCallback="{async () => {
          $dialogStateStore = 'password'
          $dialogActionStore = async () => {
            const lockedCard = await toLockedCard(card, $dialogPasswordStore)
            await replaceCard(card.id, lockedCard)
          }
        }}"
      />
    </div>
  {/each}
  <div
    class="cursor-pointer"
    on:dragover|preventDefault={() => {}}
    on:drop={async () => {
      dropped = true
      updateCardState(draggedId, 'default')
      const newCard = duplicateCard($unlockedCardStore[draggedId])
      await addNewCard(newCard)
    }}
    on:click={async () => {
      await addNewCard(newEmptyCard())
    }}
  >
    <CardPlaceHolding/>
  </div>
</div>
