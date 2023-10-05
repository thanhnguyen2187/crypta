<script lang="ts">
  import IconArrowForward from '../svg/icon-arrow-forward-ion-64.svelte'
  import { sectionState } from './store'

  let hovered = false
</script>

<div
  class="absolute top-0 right-0 h-screen w-16 transition-opacity flex items-center"
  class:bg-gray-200={hovered}
  on:mouseenter={() => hovered = true}
  on:click={() => $sectionState = 'private'}
  on:mouseleave={() => hovered = false}
>
  <div
    class="opacity-25 my-auto"
    style="width: 64px; height: 64px;"
    class:opacity-50={hovered}
  >
    <IconArrowForward/>
  </div>
</div>