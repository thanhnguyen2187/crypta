<script lang="ts">
  import CardV2 from '$lib/components/card-v2/card-v2.svelte'
  import { localSnippetStore } from '$lib/components/card/card'
  import autoAnimate from '@formkit/auto-animate'

</script>

<style>
  :global(.no-scrollbar) {
    overflow: scroll;
  }

  :global(.no-scrollbar)::-webkit-scrollbar {
    width: 0;
    height: 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
</style>

<div
  class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
>
  {#each $localSnippetStore as snippet (snippet.id)}
    <CardV2 snippet={snippet} />
  {/each}
  <CardV2 snippet={{id: 'new-card'}}/>
</div>
