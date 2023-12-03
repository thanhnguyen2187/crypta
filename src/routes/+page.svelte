<script lang="ts">
  import {
    AppBar,
    AppShell,
    AppRail,
    AppRailTile,
    popup,
  } from '@skeletonlabs/skeleton'
  import type { PopupSettings } from '@skeletonlabs/skeleton'
  import CardV2 from '$lib/components/card-v2/card-v2.svelte'
  import { localSnippetStore } from '$lib/components/card/card'

  let currentTile: number = 0

  const popupClick: PopupSettings = {
    event: 'click',
    target: 'popupClick2',
    placement: 'right',
  }

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

<AppShell>
  <svelte:fragment slot="header">
    <AppBar gridColumns="grid-cols-3">
      <svelte:fragment slot="lead">
        <div></div>
      </svelte:fragment>
      <input class="input" type="text" placeholder="Search here..."/>
      <svelte:fragment slot="trail">
        <button
          class="btn-icon variant-filled"
          use:popup={{
            event: 'hover',
            target: 'tooltip-sort',
            placement: 'bottom',
          }}
        >
          <i class="fa-xl fa-solid fa-sort"></i>
        </button>
        <button
          class="btn-icon variant-filled"
          use:popup={{
            event: 'hover',
            target: 'tooltip-settings',
            placement: 'bottom',
          }}
        >
          <i class="fa-xl fa-solid fa-gear"></i>
        </button>
      </svelte:fragment>
      <div
        data-popup="tooltip-sort"
        class="card p-2 variant-filled-tertiary [&>*]:pointer-events-none"
      >
        Sort
        <div class="arrow variant-filled-tertiary"></div>
      </div>
      <div
        data-popup="tooltip-settings"
        class="card p-2 variant-filled-tertiary [&>*]:pointer-events-none"
      >
        Settings
        <div class="arrow variant-filled-tertiary"></div>
      </div>
    </AppBar>
  </svelte:fragment>
  <div
    class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    {#each $localSnippetStore as snippet}
      <CardV2 snippet={snippet} />
    {/each}
  </div>
  <svelte:fragment
    slot="sidebarLeft"
  >
    <AppRail>
      <AppRailTile bind:group={currentTile} name="0" value={0}>Default</AppRailTile>
      <AppRailTile bind:group={currentTile} name="1" value={1}>Company</AppRailTile>
      <AppRailTile bind:group={currentTile} name="2" value={2}>Personal</AppRailTile>
      <AppRailTile bind:group={currentTile} name="3" value={3}>
        <i class="fa-xl fa-solid fa-add"></i>
      </AppRailTile>
    </AppRail>
  </svelte:fragment>
</AppShell>
