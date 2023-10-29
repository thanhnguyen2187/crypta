<script lang="ts">
  import {
    dialogContentStore,
    dialogPasswordStore,
    dialogStateStore,
    dialogSettingsStore,
    dialogTickerStore,
    dialogSettingsStateStore,
  } from './dialog'
  import { dialogActionStore } from './dialog'
  import { fade } from 'svelte/transition'
  import IconEye from '../../../svg/icon-ion-eye-24.svelte'
  import IconEyeOff from '../../../svg/icon-ion-eye-off-24.svelte'
  import IconReloadCircle from '../../../svg/icon-ion-reload-circle-24.svelte'
  import IconReload from '../../../svg/icon-ion-reload-24.svelte'
  import { writeSettings } from '../../utitlities/persistence'

  let privateContentVisible = false

  function handlePasswordKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
        const action = $dialogActionStore
        action()
        $dialogPasswordStore = ''
        $dialogStateStore = 'hidden'
        break
      case 'Escape':
        $dialogPasswordStore = ''
        $dialogStateStore = 'hidden'
        break
    }
  }

  function hideOverlay() {
    $dialogStateStore = 'hidden'
  }

  async function handleSettingsKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
        await writeSettings($dialogSettingsStore)
        $dialogStateStore = 'hidden'
        break
    }
  }
</script>

<style>
  .blur-text {
    color: transparent;
    text-shadow: 0 0 8px rgba(0,0,0,0.5);
  }
</style>

{#if $dialogStateStore !== 'hidden'}
  <div
    class="absolute w-screen h-screen left-0 top-0 bg-black opacity-25"
    transition:fade
    on:click={() => {
      $dialogStateStore = 'hidden'
    }}
  ></div>
  <div
    class="
      fixed
      left-1/2 top-1/2
      -translate-x-1/2 -translate-y-1/2
      flex flex-col
      bg-white
      rounded-xl
      px-4 py-2 border-2 gap-2
    "
  >
    {#if $dialogStateStore === 'confirm'}
      <div>Are you sure you want to do this?</div>
      <div
        class="flex gap-2"
      >
        <button
          class="cursor-pointer px-4 border-2 rounded-xl"
          on:click={() => {
            const action = $dialogActionStore
            action()
            $dialogStateStore = 'hidden'
          }}
        >Yes</button>
        <button
          class="cursor-pointer px-4 border-2 rounded-xl"
          on:click={() => {
            $dialogStateStore = 'hidden'
          }}
        >No</button>
      </div>
    {:else if $dialogStateStore === 'password'}
      <div>Password</div>
      <input
        class="border-2 rounded px-2"
        autofocus="autofocus"
        type="password"
        bind:value={$dialogPasswordStore}
        on:keydown={handlePasswordKeyDown}
        placeholder="press Enter to submit"
      />
    {:else if $dialogStateStore === 'new-private-card'}
      <div
        class="flex justify-between"
      >
        <div>Content</div>
        <button
          class:hidden={privateContentVisible}
          on:click={() => {
            privateContentVisible = true
          }}
        >
          <IconEye/>
        </button>
        <button
          class:hidden={!privateContentVisible}
          on:click={() => {
            privateContentVisible = false
          }}
        >
          <IconEyeOff/>
        </button>
      </div>
      <div>
      <textarea
        rows="5"
        class="border-2 px-1 overflow-scroll font-mono whitespace-pre no-scrollbar blur-text"
        class:blur-text={!privateContentVisible}
        on:change={async () => {}}
        on:focusin={() => privateContentVisible = true}
        on:focusout={() => privateContentVisible = false}
        spellcheck="false"
        bind:value={$dialogContentStore}
      ></textarea>
      </div>
      <div>Password</div>
      <input
        autofocus="autofocus"
        class="border-2 rounded px-2"
        type="password"
        bind:value={$dialogPasswordStore}
        on:keydown={handlePasswordKeyDown}
        placeholder="press Enter to submit"
      />
    {:else if $dialogStateStore === 'settings'}
      <div
        class="flex justify-between"
      >
        <div>Server</div>
        <div class="animate-spin">
          <IconReloadCircle/>
        </div>
      </div>
      <input
        class="border-2 rounded px-2"
        placeholder="https://your.server.com"
        bind:value={$dialogSettingsStore.serverURL}
        on:keydown={handleSettingsKeyDown}
        spellcheck="false"
      />
      <div>Username</div>
      <input
        class="border-2 rounded px-2"
        placeholder="admin"
        bind:value={$dialogSettingsStore.username}
        on:keydown={handleSettingsKeyDown}
        spellcheck="false"
      />
      <div>Password</div>
      <input
        type="password"
        placeholder="press Enter to submit"
        class="border-2 rounded px-2"
        bind:value={$dialogSettingsStore.password}
        on:keydown={handleSettingsKeyDown}
        spellcheck="false"
      />
      <div>
        {#await $dialogSettingsStateStore}
          waiting
        {:then stateStore}
          {stateStore}
        {/await}
      </div>
    {/if}
  </div>
{/if}
