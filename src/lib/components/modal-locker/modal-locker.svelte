<script lang="ts">
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { lockerShowWarningStore } from './store'

  const modalStore = getModalStore()
  let password = ''
  let dirtied = false

  function markDirty() {
    dirtied = true
  }

  function clear() {
    modalStore.clear()
  }

  function returnPassword() {
    if ($modalStore[0].response) {
      $modalStore[0].response({password})
    }
    modalStore.clear()
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      returnPassword()
    }
  }
</script>

<div
  class="card p-4 w-modal-slim flex flex-col gap-2"
>
  <label class="label">
    <span>Password</span>
    <input
      class="input"
      type="password"
      bind:value={password}
      on:focusout={markDirty}
      on:keydown={handleKeydown}
    />
  </label>
  {#if $lockerShowWarningStore}
    <div>
      Please be noticed that once the data is encrypted, the only way to decrypt
      it is to use the same password!
    </div>
  {/if}

  <div class="flex justify-end gap-2">
    <button
      class="btn variant-ghost"
      on:click={clear}
    >
      Cancel
    </button>
    <button
      class="btn variant-filled"
      on:click={returnPassword}
    >
      Submit
    </button>
  </div>
</div>
