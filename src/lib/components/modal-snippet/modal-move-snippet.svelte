<script lang="ts">
  import { foldersStoreV2 } from '$lib/components/sidebar-folder/store'
  import { globalStateStore } from '$lib/utitlities/global'
  import { modalDestinationFolderStore, modalSnippetStore } from './store'
  import { localSnippetsStore } from '$lib/components/card-v2/store'
  import { getModalStore } from '@skeletonlabs/skeleton'

  const modalStore = getModalStore()

  let shouldBeDisabled = false
  $: shouldBeDisabled = $modalDestinationFolderStore === $globalStateStore.folderId

  async function move() {
    await localSnippetsStore.move($modalSnippetStore, $globalStateStore.folderId, $modalDestinationFolderStore)
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
      value={$globalStateStore.folderId}
      disabled
    >
      {#each $foldersStoreV2 as folder}
        <option value={folder.id}>
          {folder.name}
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
      {#each $foldersStoreV2 as folder}
        <option value={folder.id}>
          {folder.name}
        </option>
      {/each}
    </select>
  </label>
  <div
    class="flex justify-between"
  >
    <div></div>
    <!--suppress HtmlWrongAttributeValue -->
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
