<script lang="ts">
  import { foldersStore } from '$lib/components/modal-settings/store'
  import { globalFolderIdStore } from '$lib/utitlities/ephemera'
  import { modalDestinationFolderStore, modalSnippetStore } from './store'
  import { localSnippetsStore } from '$lib/components/card-v2/store'
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore()

  let shouldBeDisabled = false
  $: shouldBeDisabled = $modalDestinationFolderStore === $globalFolderIdStore

  async function move() {
    await localSnippetsStore.move($modalSnippetStore, $globalFolderIdStore, $modalDestinationFolderStore)
    modalStore.close()
  }
</script>

<div
  class="card p-4 flex flex-col gap-2"
>
  <label class="label">
    <span>Current folder</span>
    <!--suppress HtmlUnknownAttribute -->
    <select
      class="select"
      value={$globalFolderIdStore}
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
