<script lang="ts">
  import CardV2 from '$lib/components/card-v2/card-v2.svelte'
  import autoAnimate from '@formkit/auto-animate'
  import { displaySnippetsStore } from '$lib/components/card-v2/store'

  import { migrate, defaultMigrationQueryMap } from '$lib/sqlite/migration'
  import { localDb } from '$lib/sqlite/global'
  import { defaultQueriesStringMap } from '$lib/sqlite/migration.js';

  (async () => {
    await migrate(localDb, defaultMigrationQueryMap, defaultQueriesStringMap)
  })()

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
  class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 hide-scrollbar"
  use:autoAnimate
>
  {#each $displaySnippetsStore as snippet (snippet.id)}
    <CardV2 snippet={snippet} />
  {/each}
  <CardV2 snippet={{id: 'new-card'}}/>
</div>
