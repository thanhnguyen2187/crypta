<script lang="ts">
  import IconChevronForward from '../svg/icon-ion-chevron-forward-48.svelte'
  import IconFolder from '../svg/icon-ion-folder-48.svelte'
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
    <IconFolder/>
  </div>
</div>
