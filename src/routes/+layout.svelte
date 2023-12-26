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
  import ModalSnippet from '$lib/components/modal-snippet/modal-snippet.svelte'
  import ModalMoveSnippet from '$lib/components/modal-snippet/modal-move-snippet.svelte'
  import ModalLocker from '$lib/components/modal-locker/modal-locker.svelte'
  import { globalStateStore } from '$lib/utitlities/ephemera'
  import SidebarFolder from '$lib/components/sidebar-folder/sidebar-folder.svelte'
  import TabGroupFolder from '$lib/components/tab-group-folder/tab-group-folder.svelte'

  initializeStores()
  const modalStore = getModalStore()

  storePopup.set({computePosition, autoUpdate, offset, shift, flip, arrow})

  const modalRegistry: Record<string, ModalComponent> = {
    snippet: {ref: ModalSnippet},
    locker: {ref: ModalLocker},
    moveSnippet: {ref: ModalMoveSnippet},
  }

  import { migrate, defaultMigrationQueryMap } from '$lib/sqlite/migration'
  import { executor, localDb } from '$lib/sqlite/global'
  import { defaultQueriesStringMap } from '$lib/sqlite/migration'
  import { onDestroy, onMount } from 'svelte'

  onMount(async () => {
    await migrate(localDb, defaultMigrationQueryMap, defaultQueriesStringMap)
  })
  onDestroy(async () => {
    await executor.close()
  })

</script>

<svelte:head>
  <title>Crypta</title>
</svelte:head>

<svelte:window
  on:load={async () => {
  }}
  on:beforeunload={async () => {
  }}
/>

<Modal components={modalRegistry} />
<Toast />

<AppShell>
  <svelte:fragment slot="header">
    <AppBar
      slotLead="hidden md:block"
      gridColumns="grid-cols-1 md:grid-cols-3"
    >
      <svelte:fragment slot="lead">
        <div></div>
      </svelte:fragment>
      <div
        class="input-group input-group-divider mb-2"
        class:grid-cols-[auto_1fr]={$globalStateStore.tags.length === 0}
        class:grid-cols-[auto_1fr_auto]={$globalStateStore.tags.length !== 0}
      >
        <div class="input-group-shim">
          <i class="fa-solid fa-search"></i>
        </div>
        <input
          type="text"
          placeholder="Search..."
          bind:value={$globalStateStore.searchInput}
        />
        <div
          class="flex gap-1"
        >
          {#each $globalStateStore.tags as tag}
            <button
              class="chip variant-filled"
              on:click={() => globalStateStore.removeTag(tag)}
            >
              {tag}
            </button>
          {/each}
        </div>
      </div>
      <TabGroupFolder />
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
