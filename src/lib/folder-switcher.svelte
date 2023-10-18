<script lang="ts">
  import IconFolder from '../svg/icon-ion-folder-48.svelte'
  import IconFolderOpen from '../svg/icon-ion-folder-open-48.svelte'
  import IconFileTray from '../svg/icon-ion-file-tray-48.svelte'
  import IconFileTrayFull from '../svg/icon-ion-file-tray-full-48.svelte'
  import { sectionState, nextSectionState, setSectionState } from './store'

  let hovered = false
</script>

<div
  class="h-screen w-16 transition-opacity flex justify-center items-center"
  class:bg-gray-200={hovered}
  on:mouseenter={() => hovered = true}
  on:mouseleave={() => hovered = false}
>
  <div
    class="opacity-25 my-auto"
    style="width: 48px; height: 48px;"
    class:opacity-50={hovered}
  >
    {#if hovered}
      <IconFileTrayFull/>
    {:else}
      <IconFileTray/>
    {/if}
  </div>
</div>
