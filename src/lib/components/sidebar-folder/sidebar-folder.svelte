<script lang="ts">
  import { AppRail, AppRailTile } from '@skeletonlabs/skeleton'
  import { catalogStore, foldersStore } from '$lib/components/modal-settings/store';
  import { globalFolderStore } from '$lib/utitlities/ephemera'
  import { createNewFolder } from '$lib/utitlities/persistence'

  let currentTile = $globalFolderStore

  function newFolder() {
    const folder = createNewFolder()
    folder.position = ($foldersStore).length + 1
    catalogStore.upsert(folder)
    $globalFolderStore = folder.id
    currentTile = folder.id
  }

</script>

<AppRail>
  {#each $foldersStore as folder}
    <AppRailTile
      bind:group={currentTile}
      value={folder.id}
      on:click={() => $globalFolderStore = folder.id}
    >
      {folder.displayName}
    </AppRailTile>
  {/each}
  <AppRailTile
    bind:group={currentTile} value={3}
    on:click={newFolder}
  >
    <i class="fa-xl fa-solid fa-add"></i>
  </AppRailTile>
</AppRail>
