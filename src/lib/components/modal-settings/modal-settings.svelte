<script lang="ts">
  import { SlideToggle } from '@skeletonlabs/skeleton'
  import { catalogStore } from './store'
  import { globalFolderIdStore } from '$lib/utitlities/ephemera'

  function handleDisplayNameChange(e: InputEvent) {
    const target = e.target as HTMLInputElement
    catalogStore.setDisplayName($globalFolderIdStore, target.value)
  }

  function handleShowLockedCardsChange(e: InputEvent) {
    const target = e.target as HTMLInputElement
    catalogStore.setShowLockedCard($globalFolderIdStore, target.checked)
  }
</script>

<div
  class="card"
>
  <div class="p-4 flex flex-col gap-4">
    <label class="label">
      <span>Folder name</span>
      <input
        value={($catalogStore)[$globalFolderIdStore].displayName}
        on:change={handleDisplayNameChange}
        class="input"
        type="text"
      />
    </label>
    <SlideToggle
      name="showLockedCards"
      checked={($catalogStore)[$globalFolderIdStore].showLockedCard}
      on:change={handleShowLockedCardsChange}
    >
      Show locked cards
    </SlideToggle>
    <div
      class="flex gap-4"
    >
      <button
        class="btn variant-filled-error"
      >
        <i class="fa-solid fa-trash"></i>
        <span>Delete</span>
      </button>
      <button
        class="btn variant-filled"
      >
        <i class="fa-solid fa-download"></i>
        <span>Download</span>
      </button>
      <button
        class="btn variant-filled"
      >
        <i class="fa-solid fa-upload"></i>
        <span>Upload</span>
      </button>
    </div>
  </div>
</div>
