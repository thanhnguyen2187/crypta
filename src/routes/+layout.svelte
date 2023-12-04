<script lang="ts">
  import "../app.postcss";
  import {
      AppBar,
      AppRail,
      AppRailTile,
      AppShell,
      getModalStore,
      initializeStores,
      Modal,
      popup
  } from '@skeletonlabs/skeleton';
  import '@fortawesome/fontawesome-free/css/fontawesome.css';
  import '@fortawesome/fontawesome-free/css/brands.css';
  import '@fortawesome/fontawesome-free/css/solid.css';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { storePopup } from "@skeletonlabs/skeleton";
  import ModalSettings from '$lib/components/modal-settings/modal-settings.svelte'
  import ModalSnippet from '$lib/components/modal-snippet/modal-snippet.svelte'
  import { globalTagsStore } from './global-store';

  initializeStores()
  const modalStore = getModalStore()

  let currentTile: number = 0
  storePopup.set({computePosition, autoUpdate, offset, shift, flip, arrow})

  const modalRegistry = {
    settings: {ref: ModalSettings},
    snippet: {ref: ModalSnippet},
  }
</script>

<Modal components={modalRegistry} />

<AppShell>
  <svelte:fragment slot="header">
    <AppBar gridColumns="grid-cols-3">
      <svelte:fragment slot="lead">
        <div></div>
      </svelte:fragment>
      <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
        <div class="input-group-shim">
          <i class="fa-solid fa-search"></i>
        </div>
        <input type="text" placeholder="Search..."/>
        <div
          class="flex gap-1"
          class:hidden={($globalTagsStore).length === 0}
        >
          {#each $globalTagsStore as tag}
            <span
              class="chip variant-filled"
              on:click={() => globalTagsStore.remove(tag)}
            >
              {tag}
            </span>
          {/each}
        </div>
      </div>
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
          on:click={() => modalStore.trigger({
            type: 'component',
            component: 'settings',
          })}
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
  <slot />
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
