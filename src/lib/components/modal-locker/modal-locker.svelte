<script lang="ts">
  import { getModalStore } from '@skeletonlabs/skeleton';

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
    />
  </label>
  <div>
    Please be noticed that once the snippet is locked, the only way to unlock it
    is to use the same password!
  </div>

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
      Save
    </button>
  </div>
</div>
