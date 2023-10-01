<script lang="ts">
  import Card from '$lib/card.svelte'
  import CardPlaceHolding from '$lib/card-placeholding.svelte'
  import Toaster from '$lib/toaster.svelte'
  import { sampleCards } from '$lib/card'
  import autoAnimate from '@formkit/auto-animate'

  let cards = sampleCards
  let draggedTitle = ''
  let draggedIndex = -1
  let dropped = true

  function removeAtIndex(items: any[], index: number): any[] {
    return [
      ...items.slice(0, index),
      ...items.slice(index + 1),
    ]
  }

  /*
  * Take an item at one index and put it in another index.
  *
  * @param index1 the "moving" item's index
  * @param index2 the "pivot" item's index
  * @example
  * inject(['a', 'b', 'c', 'd', 'e'], 1, 3)
  * // first, we move `b` out of the place
  * // ['a', 'c', 'd', 'e']
  * // then we insert `b` to the place after `d`
  * // ['a', 'c', 'd', 'b', 'e']
  * */
  function inject(items: any[], index1: number, index2: number): any[] {
    if (index1 == index2) {
      return items
    }

    items = items.slice()
    const item = items.splice(index1, 1)[0]
    items = [
      ...items.slice(0, index2),
      item,
      ...items.slice(index2),
    ]
    return items
  }

  async function handleNewPaste(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'v') {
      const text = await navigator.clipboard.readText()
      cards.push({
        id: (cards.length + 1).toString(),
        title: 'untitled',
        state: 'default',
        content: text,
        encrypted: false,
        language: 'plaintext',
      })
      cards = cards
    }
  }
</script>

<div
  class="container mx-auto my-4 grid grid-cols-4 gap-4 justify-items-center"
  use:autoAnimate
  tabindex="-1"
  on:keydown={handleNewPaste}
>
  {#each cards as card, index (card.id)}
    <div
      draggable="true"
      class="cursor-grab"
      on:dragstart={() => {
        draggedIndex = index
        dropped = false
        setTimeout(() => {
          cards[index].state = 'draggedOut'
        })
      }}
      on:dragover|preventDefault={() => {}}
      on:dragend={() => {
        if (!dropped) {
          cards[index].state = 'default'
          dropped = true
        }
      }}
      on:drop={() => {
        dropped = true
        setTimeout(() => {
          cards[draggedIndex].state = 'default'
          cards = inject(cards, draggedIndex, index)
        })
      }}
    >
      <Card
        title="{card.title}"
        state="{card.state}"
        content="{card.content}"
        language="{card.language}"
        removalCallback="{() => {cards = removeAtIndex(cards, index)}}"
      />
    </div>
  {/each}
  <div
    class="cursor-pointer"
    on:dragover|preventDefault={() => {}}
    on:drop={() => {
      dropped = true
      cards[draggedIndex].state = 'default'
      const newCard = {
        ...cards[draggedIndex],
        id: (cards.length + 1).toString(),
        state: 'default',
      }
      cards.push(newCard)
      cards = cards
    }}
    on:click={() => {
      const newCard = {
        id: (cards.length + 1).toString(),
        title: 'untitled',
        language: 'plaintext',
        content: '',
        encrypted: false,
        state: 'default',
      }
      cards.push(newCard)
      cards = cards
    }}
  >
    <CardPlaceHolding/>
  </div>
</div>

<Toaster/>