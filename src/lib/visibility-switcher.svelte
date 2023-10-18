<script lang="ts">
  import IconArrowForward from '../svg/icon-ion-arrow-forward-64.svelte'
  import IconArrowBack from '../svg/icon-ion-arrow-back-64.svelte'
  import { sectionState, nextSectionState, setSectionState } from './store'

  let state : 'default' | 'hovered' | 'clicked' = 'default'
  let hovered = false
  let clicked = false
  $: hovered = state === 'hovered'
  $: clicked = state === 'clicked'
</script>

<div
  class="h-screen w-16 transition-opacity flex items-center"
  class:bg-gray-200={hovered}
  class:bg-gray-300={clicked}
  on:mouseenter={() => state = 'hovered'}
  on:mousedown={() => state = 'clicked'}
  on:click={() => setSectionState(nextSectionState($sectionState))}
  on:mouseup={() => state = 'default'}
  on:mouseleave={() => state = 'default'}
>
  <div
    class="opacity-25 my-auto"
    style="width: 64px; height: 64px;"
    class:opacity-50={hovered}
    class:opacity-75={clicked}
  >
    {#if $sectionState === 'public'}
      <IconArrowForward/>
    {:else}
      <IconArrowBack/>
    {/if}
  </div>
</div>
