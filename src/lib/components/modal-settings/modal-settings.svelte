<script lang="ts">
  import { settingsV2Store } from '$lib/utitlities/global'
  import { inputStateStore } from './store'
  import { getModalStore, Tab, TabGroup } from '@skeletonlabs/skeleton'
  import { onMount } from 'svelte'
  import { remoteDbPairStore } from '$lib/sqlite/global'
  import type { SettingsV2 } from '$lib/utitlities/ephemera'

  const modalStore = getModalStore()

  let currentTab: 'connection' = 'connection'
  onMount(async () => {
    await reload()
  })

  async function reload() {
    // @ts-ignore
    await remoteDbPairStore.reload()
  }

  function handleChange(e: Event, property: (keyof SettingsV2)) {
    // @ts-ignore
    $settingsV2Store[property] = (e?.target as HTMLInputElement).value
  }

</script>

<div
  class="card w-modal-slim relative"
>
  <button
    class="badge-icon absolute md:hidden top-2 right-2"
    on:click={() => modalStore.close()}
  >
    <i class="fa-xl fa-solid fa-close"></i>
  </button>
  <TabGroup class="card-header">
    <Tab
      bind:group={currentTab}
      name="connection"
      value="connection"
    >
      <span>Connection</span>
    </Tab>
  </TabGroup>

  <section class="p-6 flex flex-col gap-2">
    {#if currentTab === 'connection'}
      <label class="label">
        <span>Database URL</span>
        <input
          class="input"
          spellcheck="false"
          value={$settingsV2Store.dbURL}
          on:change={e => handleChange(e, 'dbURL')}
        />
      </label>
      <label class="label">
        <span>Token</span>
        <input
          class="input"
          spellcheck="false"
          on:change={e => handleChange(e, 'token')}
        />
      </label>
      <aside
        class="mt-4 alert"
        class:hidden={$inputStateStore.display === 'none'}
        class:variant-filled-warning={$inputStateStore.display === 'warning'}
        class:variant-filled-error={$inputStateStore.display === 'error'}
        class:variant-filled-success={$inputStateStore.display === 'success'}
      >
        <div class="alert-message">
          {$inputStateStore.message}
        </div>
      </aside>
    {/if}
  </section>
  <footer class="card-footer flex gap-2 justify-end">
    {#if currentTab === 'connection'}
      <button
        class="btn variant-ghost"
        on:click={reload}
      >
        Refresh
      </button>
    {/if}
  </footer>
</div>
