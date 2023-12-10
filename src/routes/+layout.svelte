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
    popup,
  } from '@skeletonlabs/skeleton';
  import type { ModalComponent } from '@skeletonlabs/skeleton'
  import '@fortawesome/fontawesome-free/css/fontawesome.css';
  import '@fortawesome/fontawesome-free/css/brands.css';
  import '@fortawesome/fontawesome-free/css/solid.css';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { storePopup } from "@skeletonlabs/skeleton";
  import ModalSettings from '$lib/components/modal-settings/modal-settings.svelte'
  import ModalSnippet from '$lib/components/modal-snippet/modal-snippet.svelte'
  import ModalLocker from '$lib/components/modal-locker/modal-locker.svelte'
  import { globalSearchStore, globalTagsStore } from '$lib/utitlities/ephemera'
  import SidebarFolder from '$lib/components/sidebar-folder/sidebar-folder.svelte'

  initializeStores()
  const modalStore = getModalStore()

  storePopup.set({computePosition, autoUpdate, offset, shift, flip, arrow})

  const modalRegistry: Record<string, ModalComponent> = {
    settings: {ref: ModalSettings},
    snippet: {ref: ModalSnippet},
    locker: {ref: ModalLocker},
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
        <input type="text" placeholder="Search..." bind:value={$globalSearchStore}/>
        <div
          class="flex gap-1"
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
    <SidebarFolder />
  </svelte:fragment>
</AppShell>
