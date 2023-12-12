<script lang="ts">
  import { foldersStore } from '$lib/components/modal-settings/store'
  import { globalFolderStore } from '$lib/utitlities/ephemera'
  import { modalDestinationFolderStore, modalSnippetStore } from './store'
  import { localSnippetsStore } from '$lib/components/card/card';
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore()

  let shouldBeDisabled = false
  $: shouldBeDisabled = $modalDestinationFolderStore === $globalFolderStore

  async function move() {
    localSnippetsStore.move($modalSnippetStore, $globalFolderStore, $modalDestinationFolderStore)
    modalStore.close()
  }
</script>

<div
  class="card p-4 flex flex-col gap-2"
>
  <label class="label">
    <span>Current folder</span>
    <select
      class="select"
      value={$globalFolderStore}
      disabled
    >
      {#each $foldersStore as folder}
        <option value={folder.id}>
          {folder.displayName}
        </option>
      {/each}
    </select>
  </label>
  <label class="label">
    <span>Destination folder</span>
    <select
      class="select"
      bind:value={$modalDestinationFolderStore}
    >
      {#each $foldersStore as folder}
        <option value={folder.id}>
          {folder.displayName}
        </option>
      {/each}
    </select>
  </label>
  <div
    class="flex justify-between"
  >
    <div></div>
    <button
      class="btn variant-filled"
      disabled={shouldBeDisabled}
      on:click={move}
    >
      <i class="fa-solid fa-arrow-up-from-bracket"></i>
      <span>Move</span>
    </button>
  </div>
</div>
