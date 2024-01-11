<script lang="ts">
  import { getModalStore, Tab, TabAnchor, TabGroup, popup } from '@skeletonlabs/skeleton'
  import { globalStateStore } from '$lib/utitlities/ephemera'
  import { foldersStoreV2 } from '$lib/components/sidebar-folder/store'
  import type { DisplayFolder } from '$lib/components/sidebar-folder/store'
  import { localSnippetsStore } from '$lib/components/card-v2/store'
  let currentTab = $globalStateStore.folderId

  const modalStore = getModalStore()

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
          await foldersStoreV2.upsert(folder)
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
      // noinspection TypeScriptUnresolvedReference
      modalStore.trigger({
        type: 'confirm',
        title: 'Are you sure about this action?',
        body:
          `The folder named "${folder.name}" with
         ${$localSnippetsStore.length} record(s) would be deleted completely!`,
        response: (answer: boolean) => {
          if (answer) {
            foldersStoreV2.delete(folder.id)
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
    const folder: DisplayFolder = {
      id: crypto.randomUUID(),
      name: 'Untitled',
      position: $foldersStoreV2.length + 1,
    }
    folder.position = $foldersStoreV2.length + 1
    foldersStoreV2.upsert(folder)
    $globalStateStore.folderId = folder.id
    currentTab = folder.id

    actionRename.callback(folder)
  }
</script>

<TabGroup class="block md:hidden">
  {#each $foldersStoreV2 as folder}
    <div
      data-popup="tab-actions-{folder.id}"
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

    <Tab
      bind:group={currentTab}
      name={folder.id}
      value={folder.id}
      on:click={() => $globalStateStore.folderId = folder.id}>
        <span>{folder.name}</span>
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
