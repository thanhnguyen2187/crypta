<script lang="ts">
  import IconArrowForward from '../svg/icon-arrow-forward-ion-64.svelte'
  import IconArrowBack from '../svg/icon-arrow-back-ion-64.svelte'
  import { sectionState, nextSectionState, setSectionState } from './store'

  let hovered = false
</script>

<div
  class="absolute top-0 right-0 h-screen w-16 transition-opacity flex items-center"
  class:bg-gray-200={hovered}
  on:mouseenter={() => hovered = true}
  on:click={() => setSectionState(nextSectionState($sectionState))}
  on:mouseleave={() => hovered = false}
>
  <div
    class="opacity-25 my-auto"
    style="width: 64px; height: 64px;"
    class:opacity-50={hovered}
  >
    {#if $sectionState === 'public'}
      <IconArrowForward/>
    {:else}
      <IconArrowBack/>
    {/if}
  </div>
</div>
