<script lang="ts">
  import Card from './card.svelte'
  import CardPlaceHolding from './card-placeholding.svelte'
  import { addNewCard, duplicateCard, updateCardState, unlockedCardStore, removeCard } from './card.ts'
  import autoAnimate from '@formkit/auto-animate'
  import { injectCard, newEmptyCard } from '$lib/card.js'

  let draggedIndex = -1
  let dropped = true

  async function handleNewPaste(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'v') {
      const text = await navigator.clipboard.readText()
      const card = newEmptyCard()
      card.content = text
      addNewCard(card)
    }
  }
</script>

<div
  class="container mx-auto my-4 grid grid-cols-4 gap-4 justify-items-center"
  use:autoAnimate
  tabindex="-1"
  on:keydown={handleNewPaste}
>
  {#each $unlockedCardStore as card, index (card.id)}
    <div
      draggable="true"
      class="cursor-grab"
      on:dragstart={() => {
        draggedIndex = index
        dropped = false
        updateCardState(index, 'draggedOut')
      }}
      on:dragover|preventDefault={() => {}}
      on:dragend={() => {
        if (!dropped) {
          updateCardState(index, 'default')
          dropped = true
        }
      }}
      on:drop={() => {
        dropped = true
        injectCard(draggedIndex, index)
        updateCardState(index, 'default')
      }}
    >
      <Card
        title="{card.title}"
        state="{card.state}"
        content="{card.content}"
        language="{card.language}"
        removalCallback="{() => {
          removeCard(card.id)
        }}"
      />
    </div>
  {/each}
  <div
    class="cursor-pointer"
    on:dragover|preventDefault={() => {}}
    on:drop={() => {
      dropped = true
      updateCardState(draggedIndex, 'default')
      const newCard = duplicateCard($unlockedCardStore[draggedIndex])
      addNewCard(newCard)
    }}
    on:click={() => {
      addNewCard(newEmptyCard())
    }}
  >
    <CardPlaceHolding/>
  </div>
</div>
