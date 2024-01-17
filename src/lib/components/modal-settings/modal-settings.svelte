<script lang="ts">
  import { settingsStore } from '$lib/utitlities/ephemera'
  import { logsStore, logToLine } from './store'
  import { onMount } from 'svelte'
  import { Tab, TabGroup } from '@skeletonlabs/skeleton'

  onMount(() => {
    const log = {
      date: new Date().getTime(),
      content: `Read settings from OPFS ${JSON.stringify($settingsStore)}`
    }
    $logsStore.push(log)
  })

  let logsContent = ''
  $: logsContent = $logsStore.map(logToLine).join('\n')

  let currentTab: 'connection' | 'logging' = 'connection'
  const tabs = [
    {
      id: 'connection',
      name: 'Connection',
    },
    {
      id: 'data',
      name: 'Data',
    },
    {
      id: 'logging',
      name: 'Logging',
    },
  ]
</script>

<div
  class="card w-modal-slim relative"
>
  <button
    class="badge-icon absolute md:hidden top-2 right-2"
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

  <section class="m-4 flex flex-col gap-2">
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
    <label class="label">
      <span>Logs</span>
      <textarea
        class="textarea font-mono"
        readonly="readonly"
        rows="7"
      >{logsContent}</textarea>
    </label>
  </section>
  <footer class="card-footer flex gap-2 justify-end">
    <button
      class="btn variant-filled"
      on:click={() => $logsStore.length = 0}
    >
      <i class="fa-solid fa-trash"></i>
      <span>Clear Logs</span>
    </button>
  </footer>
</div>
