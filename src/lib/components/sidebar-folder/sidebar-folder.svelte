<script lang="ts">
  import { AppRail, AppRailAnchor, AppRailTile, getModalStore, popup } from '@skeletonlabs/skeleton'
  import { localFoldersStore } from './store'
  import { globalStateStore } from '$lib/utitlities/global'
  import { higherSnippetsStore } from '$lib/sqlite/global'
  import type { DisplayFolder } from '$lib/utitlities/persistence';

  const modalStore = getModalStore()

  let currentTile = $globalStateStore.folderId

  type TileAction = {
    text: string
    faIconClass: string
    callback: (folder: DisplayFolder) => void
  }
  const actionRename: TileAction = {
    text: 'Rename',
    faIconClass: 'fa-edit',
    callback: (folder: DisplayFolder) => {
      modalStore.trigger({
        type: 'prompt',
        title: 'Enter new folder name',
        value: folder.name,
        response: async (name: string | false) => {
          if (!name) {
            return
          }
          folder.name = name
          await localFoldersStore.upsert(folder)
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
    callback: (folder: DisplayFolder) => {
      modalStore.trigger({
        type: 'confirm',
        title: 'Are you sure about this action?',
        body:
         `The folder named "${folder.name}" with
         ${$higherSnippetsStore.length} record(s) would be deleted completely!`,
        response: (answer: boolean) => {
          if (answer) {
            localFoldersStore.delete(folder.id)
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

  async function newFolder() {
    const folder: DisplayFolder = {
      id: crypto.randomUUID(),
      name: 'Untitled',
      position: $localFoldersStore.length + 1,
    }
    $globalStateStore.folderId = folder.id
    currentTile = folder.id

    await localFoldersStore.upsert(folder)
    actionRename.callback(folder)
  }

</script>

<AppRail class="hidden md:block">
  {#each $localFoldersStore as folder}
    <div
      data-popup="rail-tile-actions-{folder.id}"
      class="z-10"
    >
      <ul class="list-nav variant-filled gap-2 rounded-container-token">
        {#each actions as action}
          <li>
            <button class="w-full" on:click={() => action.callback(folder)}>
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
        {folder.name}
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
