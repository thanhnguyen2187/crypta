<script lang="ts">
  import { settingsStore } from '$lib/utitlities/ephemera'
  import { logsStore, inputStateStore, logToLine } from './store'
  import { onDestroy, onMount } from 'svelte'
  import { getModalStore, Tab, TabGroup } from '@skeletonlabs/skeleton'

  const modalStore = getModalStore()

  onMount(() => {
    logsStore.addLog(`Read settings from OPFS ${JSON.stringify($settingsStore)}`)
  })

  let logsContent = ''
  $: logsContent = $logsStore.map(logToLine).join('\n')

  let currentTab: 'connection' | 'logging' = 'connection'
  let connectableURL = false
  $: {
    (() => {
      if (!connectableURL) {
        $inputStateStore.display = 'warning'
        $inputStateStore.message = 'Could not connect to the designated URL!'
        return
      }

      $inputStateStore.display = 'success'
      $inputStateStore.message = 'Connected successfully!'
    })()
  }

  const unsubscribeSettings = settingsStore.subscribe(
    async (settings) => {
      connectableURL = await isConnectable(settings.serverURL)
    }
  )

  async function isConnectable(url: string): Promise<boolean> {
    try {
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction: [
              {
                query: 'SELECT 1;'
              }
            ]
          })
        },
      )
      console.log(response)
      return true
    }
    catch (e) {
      return false
    }
  }

  onDestroy(() => {
    unsubscribeSettings()
  })
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
        class="textarea font-mono"
        readonly="readonly"
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
