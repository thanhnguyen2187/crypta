<script>
  import { toasterTextStore } from './toaster.ts'
  import { fly } from "svelte/transition"
</script>

{#if $toasterTextStore}
  <div
    class="absolute top-2 right-4 bg-white border-2 rounded-xl py-1 px-2"
    transition:fly={{ x: 0, y: -50 }}
  >{$toasterTextStore}</div>
{/if}
