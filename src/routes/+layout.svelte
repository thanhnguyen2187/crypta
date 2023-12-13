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
    popup, Toast,
  } from '@skeletonlabs/skeleton';
  import type { ModalComponent } from '@skeletonlabs/skeleton'
  import '@fortawesome/fontawesome-free/css/fontawesome.css'
  import '@fortawesome/fontawesome-free/css/brands.css'
  import '@fortawesome/fontawesome-free/css/solid.css'
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom'
  import { storePopup } from "@skeletonlabs/skeleton"
  import ModalSettings from '$lib/components/modal-settings/modal-settings.svelte'
  import ModalSnippet from '$lib/components/modal-snippet/modal-snippet.svelte'
  import ModalMoveSnippet from '$lib/components/modal-snippet/modal-move-snippet.svelte'
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
    moveSnippet: {ref: ModalMoveSnippet},
  }
</script>

<svelte:head>
  <title>Crypta</title>
</svelte:head>

<Modal components={modalRegistry} />
<Toast />

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
            <button
              class="chip variant-filled"
              on:click={() => globalTagsStore.remove(tag)}
            >
              {tag}
            </button>
          {/each}
        </div>
      </div>
      <svelte:fragment slot="trail">
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <slot />
  <svelte:fragment
    slot="sidebarLeft"
  >
    <SidebarFolder />
  </svelte:fragment>
</AppShell>
