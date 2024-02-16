<script lang="ts">
  import { settingsStore } from '$lib/utitlities/global'
  import { logsStore, inputStateStore, logToLine } from './store'
  import { onDestroy, onMount } from 'svelte'
  import { getModalStore, Tab, TabGroup } from '@skeletonlabs/skeleton'
  import { sqlitergExecutorStore } from '$lib/sqlite/global'

  const modalStore = getModalStore()

  onMount(() => {
    logsStore.addLog(`Read serverURL from OPFS ${$settingsStore.serverURL}`)
  })

  let logsContent = ''
  $: logsContent = $logsStore.map(logToLine).join('\n')

  let currentTab: 'connection' | 'logging' = 'connection'
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

  onDestroy(() => {})
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
    <Tab
      bind:group={currentTab}
      name="logging"
      value="logging"
    >
      <span>Logging</span>
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
    {:else if currentTab === 'logging'}
      <textarea
        readonly
        class="textarea font-mono"
        rows="7"
      >{logsContent}</textarea>
    {/if}
  </section>
  <footer class="card-footer flex gap-2 justify-end">
    {#if currentTab === 'logging'}
      <button
        class="btn variant-filled"
        on:click={() => $logsStore.length = 0}
      >
        <i class="fa-solid fa-trash"></i>
        <span>Clear Logs</span>
      </button>
    {/if}
  </footer>
</div>
