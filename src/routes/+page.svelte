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

  function replaceAtIndex(items: any[], index: number, item: any): any[] {
    return [
      ...items.slice(0, index),
      item,
      ...items.slice(index + 1),
    ]
  }

</script>

<div
  class="container mx-auto my-4 grid grid-cols-4 gap-4 justify-items-center"
>
  {#each titles as title, index}
    <div
      draggable="true"
      class="cursor-grab"
      on:dragstart={() => {
        console.log(`Dragstart index ${index}`)
        draggedTitle = title
        draggedIndex = index
        dropped = false
        setTimeout(() => {titles = replaceAtIndex(titles, index, '')})
        // setTimeout(() => {titles = removeAtIndex(titles, index)})
      }}
      on:dragover|preventDefault={() => {}}
      on:dragend={() => {
        console.log(`Dragend index ${index}`)
        if (!dropped) {
          dropped = true
          setTimeout(() => {titles = replaceAtIndex(titles, index, draggedTitle)})
        }
      }}
      on:drop|preventDefault={() => {
        console.log(`Drop index ${index}`)
        dropped = true
        setTimeout(() => {
          titles = addAtIndex(titles, index, draggedTitle)
          // titles = removeAtIndex(titles, draggedIndex)
        })
      }}
    >
      <Card title="{title}"/>
    </div>
  {/each}
</div>
