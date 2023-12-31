<script lang="ts">
  import { AppRail, AppRailAnchor, AppRailTile, getModalStore, popup } from '@skeletonlabs/skeleton'
  import { catalogStore, foldersStore } from './store';
  import { globalStateStore } from '$lib/utitlities/ephemera'
  import { createNewFolder } from '$lib/utitlities/persistence'
  import { localSnippetsStore } from '$lib/components/card-v2/store'

  const modalStore = getModalStore()

  let currentTile = $globalStateStore.folderId

  type TileAction = {
    text: string
    faIconClass: string
    callback: (folderId: string) => void
  }
  const actionRename: TileAction = {
    text: 'Rename',
    faIconClass: 'fa-edit',
    callback: (folderId: string) => {
      modalStore.trigger({
        type: 'prompt',
        title: 'Enter new folder name',
        value: $catalogStore[folderId].displayName,
        response: (name: string | false) => {
          if (!name) {
            return
          }
          catalogStore.setDisplayName(folderId, name)
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
    callback: (folderId: string) => {
      // noinspection TypeScriptUnresolvedReference
      modalStore.trigger({
        type: 'confirm',
        title: 'Are you sure about this action?',
        body:
         `The folder named "${$catalogStore[folderId].displayName}" with
         ${$localSnippetsStore.length} record(s) would be deleted completely!`,
        response: (answer: boolean) => {
          if (answer) {
            catalogStore.delete(folderId)
            $globalStateStore.folderId = 'default'
            currentTile = 'default'
          }
        },
      })
    },
  }
  const actions = [
    actionRename,
    // TODO: implement the callbacks for those actions and enable them then
    // actionDownload,
    // actionUpload,
    actionDelete,
  ]

  function newFolder() {
    const folder = createNewFolder()
    folder.position = ($foldersStore).length + 1
    catalogStore.upsert(folder)
    $globalStateStore.folderId = folder.id
    currentTile = folder.id

    actionRename.callback(folder.id)
  }

</script>

<AppRail class="hidden md:block">
  {#each $foldersStore as folder}
    <div
      data-popup="rail-tile-actions-{folder.id}"
      class="z-10"
    >
      <ul class="list-nav variant-filled gap-2 rounded-container-token">
        {#each actions as action}
          <li>
            <button class="w-full" on:click={() => action.callback(folder.id)}>
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
      on:click={() => $globalStateStore.folderId = folder.id}
      class="relative"
    >
      {#if folder.id === $globalStateStore.folderId}
        <!--
        We need `stopPropagation` since without it, the click would be received
        by the parent `AppRailTle`, which reset the whole element's state and
        close the popup immediately.
        -->
        <button
          class="badge-icon variant-filled absolute -top-0 -right-0 z-10"
          on:click|stopPropagation={() => {}}
          use:popup={{
            event: 'click',
            target: 'rail-tile-actions-'+ folder.id,
            placement: 'right',
          }}
        >
          <i class="fa-solid fa-ellipsis-v"></i>
        </button>
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
