<script lang="ts">
  import Card from '$lib/card.svelte'
  import autoAnimate from '@formkit/auto-animate'

  let titles = [
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
  ]
  let hidden = [
    false,
    false,
    false,
    false,
    false,
    false,
  ]

  let draggedTitle = ''
  let draggedIndex = -1
  let dropped = true

  function removeAtIndex(items: any[], index: number): any[] {
    return [
      ...items.slice(0, index),
      ...items.slice(index + 1),
    ]
  }

  function addAtIndex(items: any[], index: number, item: any): any[] {
    return [
      ...items.slice(0, index),
      item,
      ...items.slice(index),
    ]
  }
</script>

<div
  class="container mx-auto my-4 grid grid-cols-4 gap-4 justify-items-center"
  use:autoAnimate
>
  {#each titles as title, index (title.toString())}
    <div
      draggable="true"
      class="cursor-grab"
      on:dragstart={() => {
        draggedTitle = title
        draggedIndex = index
        dropped = false
        setTimeout(() => {
          titles = removeAtIndex(titles, index)
          titles.push('')
          titles = titles
        })
      }}
      on:dragover|preventDefault={() => {}}
      on:dragend={() => {
        if (!dropped) {
          titles = addAtIndex(titles, draggedIndex, draggedTitle)
          titles = removeAtIndex(titles, titles.length - 1)
          dropped = true
        }
      }}
      on:drop|preventDefault={() => {
        dropped = true
        setTimeout(() => {
          titles = addAtIndex(titles, index, draggedTitle)
          titles = removeAtIndex(titles, titles.length - 1)
        })
      }}
    >
      <Card title="{title}"/>
    </div>
  {/each}
</div>
