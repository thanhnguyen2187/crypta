<script lang="ts">
  import { AppRail, AppRailAnchor, AppRailTile, getModalStore, popup } from '@skeletonlabs/skeleton'
  import { catalogStore, foldersStore } from '$lib/components/modal-settings/store';
  import { globalFolderStore } from '$lib/utitlities/ephemera'
  import { createNewFolder } from '$lib/utitlities/persistence'

  const modalStore = getModalStore()

  let currentTile = $globalFolderStore

  type TileAction = {
    text: string
    faIconClass: string
    callback: () => void
  }
  const actionRename: TileAction = {
    text: 'Rename',
    faIconClass: 'fa-edit',
    callback: () => {
      modalStore.trigger({
        type: 'prompt',
        title: 'Enter new folder name',
        response: (name: string) => {
        },
      })
    },
  }
  const actionUpload: TileAction = {
    text: 'Import',
    faIconClass: 'fa-upload',
    callback: () => {},
  }
  const actionDownload: TileAction = {
    text: 'Export',
    faIconClass: 'fa-download',
    callback: () => {},
  }
  const actionDelete: TileAction = {
    text: 'Delete',
    faIconClass: 'fa-trash',
    callback: () => {},
  }
  const actions = [
    actionRename,
    actionDownload,
    actionUpload,
    actionDelete,
  ]

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
    <div
      data-popup="rail-tile-actions-{folder.id}"
      class="z-10"
    >
      <ul class="list-nav variant-filled gap-2 rounded-container-token">
        {#each actions as action}
          <li>
            <button class="w-full" on:click={() => action.callback()}>
              <span>
                <i class="fa-solid {action.faIconClass}"></i>
              </span>
              <span>{action.text}</span>
            </button>
          </li>
        {/each}
      </ul>
    </div>

    <AppRailTile
      bind:group={currentTile}
      name={folder.id}
      value={folder.id}
      on:click={() => $globalFolderStore = folder.id}
      class="relative"
    >
      {#if folder.id === $globalFolderStore}
        <span
          class="badge-icon variant-filled absolute -top-0 -right-0 z-10"
          on:click|stopPropagation={() => {}}
          use:popup={{
            event: 'click',
            target: 'rail-tile-actions-'+ folder.id,
            placement: 'right',
          }}
        >
          <i class="fa-solid fa-ellipsis-v"></i>
        </span>
      {/if}
      <span>
        {folder.displayName}
      </span>
    </AppRailTile>
  {/each}
  <AppRailAnchor
    href="#"
    target="_self"
    on:click={newFolder}
  >
    <i class="fa-xl fa-solid fa-add"></i>
  </AppRailAnchor>
</AppRail>
