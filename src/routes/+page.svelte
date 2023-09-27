<script lang="ts">
  import Card from '$lib/card.svelte'

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

  let removedTitle = ''

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
>
  {#each titles as title, index}
    <div
      draggable="true"
      on:dragstart={() => {
        removedTitle = title
        setTimeout(() => titles = removeAtIndex(titles, index))
        // titles = removeAtIndex(titles, index)
      }}
      on:dragend={() => {
        setTimeout(() => titles = addAtIndex(titles, index, removedTitle))
      }}
    >
      <Card title="{title}"/>
    </div>
  {/each}
</div>