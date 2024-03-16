<script lang="ts">
  import { settingsV2Store } from '$lib/utitlities/global'
  import { inputStateStore } from './store'
  import { getModalStore, Tab, TabGroup } from '@skeletonlabs/skeleton'

  const modalStore = getModalStore()

  let currentTab: 'connection' = 'connection'
  $: {}

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
          bind:value={$settingsV2Store.dbURL}
        />
      </label>
      <label class="label">
        <span>Token</span>
        <input
          class="input"
          spellcheck="false"
          bind:value={$settingsV2Store.token}
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
      >
        Refresh
      </button>
      <button
        class="btn variant-filled"
      >
        Save
      </button>
    {/if}
  </footer>
</div>
