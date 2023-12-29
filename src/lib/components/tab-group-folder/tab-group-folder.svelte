<script lang="ts">
  import { AppRailTile, getModalStore, Tab, TabAnchor, TabGroup, popup } from '@skeletonlabs/skeleton'
  import { globalStateStore } from '$lib/utitlities/ephemera'
  import { catalogStore, foldersStore } from '$lib/components/sidebar-folder/store'
  import { localSnippetsStore } from '$lib/components/card-v2/store'
  import { createNewFolder } from '$lib/utitlities/persistence'
  let currentTab = $globalStateStore.folderId

  const modalStore = getModalStore()

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
            currentTab = 'default'
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
    currentTab = folder.id

    actionRename.callback(folder.id)
  }
</script>

<TabGroup class="block md:hidden">
  {#each $foldersStore as folder}
    <div
      data-popup="tab-actions-{folder.id}"
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

    <Tab
      bind:group={currentTab}
      name={folder.id}
      value={folder.id}
      on:click={() => $globalStateStore.folderId = folder.id}>
        <span>{folder.displayName}</span>
        {#if folder.id === $globalStateStore.folderId}
          <button
            class="ml-2 fa-solid fa-ellipsis-h z-10"
            on:click|stopPropagation={() => {}}
            use:popup={{
              event: 'click',
              target: 'tab-actions-'+ folder.id,
              placement: 'bottom',
            }}
          ></button>
      {/if}
    </Tab>
  {/each}

  <TabAnchor
    href="#"
    target="_self"
    on:click={newFolder}
  >
    <i class="fa-solid fa-add"></i>
  </TabAnchor>
</TabGroup>
