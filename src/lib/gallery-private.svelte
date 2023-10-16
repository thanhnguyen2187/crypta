<script lang="ts">
  import CardLocked from './card-locked.svelte'
  import CardPlaceHolding from './card-placeholding.svelte'
  import { lockedCardStore } from './card.ts'
  import { promptNewPrivateCard } from '$lib/dialog'
</script>

<div
  class="container mx-auto my-4 grid grid-cols-4 gap-4 justify-items-center"
  tabindex="-1"
>
  {#each $lockedCardStore as card, index (card.id)}
    <div
      class="cursor-grab"
    >
      <CardLocked
        card="{card}"
      />
    </div>
  {/each}
  <button
    on:click={() => {
      promptNewPrivateCard('abracadabra')
    }}
  >
    <CardPlaceHolding/>
  </button>
</div>
