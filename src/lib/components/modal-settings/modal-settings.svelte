<script lang="ts">
  import { settingsStore } from '$lib/utitlities/global'
  import { inputStateStore } from './store'
  import { getModalStore, Tab, TabGroup } from '@skeletonlabs/skeleton'
  import { sqlitergExecutorStore } from '$lib/sqlite/global'

  const modalStore = getModalStore()

  let currentTab: 'connection' = 'connection'
  $: {
    (async () => {
      if ($settingsStore.serverURL === '') {
        $inputStateStore.display = 'none'
        $inputStateStore.message = ''
        return
      }
      if (!await $sqlitergExecutorStore.isReachable()) {
        $inputStateStore.display = 'warning'
        $inputStateStore.message = 'Could not connect to the designated URL!'
        return
      }
      if (!await $sqlitergExecutorStore.isAuthenticated()) {
        $inputStateStore.display = 'warning'
        $inputStateStore.message = 'Wrong user name or password!'
        return
      }

      $inputStateStore.display = 'success'
      $inputStateStore.message = 'Connected successfully.'
    })()
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
          <span>Server URL</span>
          <input
            class="input"
            spellcheck="false"
            bind:value={$settingsStore.serverURL}
          />
          </label>
      <label class="label">
          <span>Username</span>
          <input
            class="input"
            spellcheck="false"
            bind:value={$settingsStore.username}
          />
          </label>
      <label class="label">
          <span>Password</span>
          <input
            class="input"
            type="password"
            spellcheck="false"
            bind:value={$settingsStore.password}
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
  </footer>
</div>
