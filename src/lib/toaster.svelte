<script>
  import { toasterText } from '$lib/store.ts'
  import { fly } from "svelte/transition"
</script>

{#if $toasterText}
  <div
    class="absolute top-2 right-4 bg-white border-2 rounded-xl py-1 px-2"
    transition:fly={{ x: 0, y: -50 }}
  >{$toasterText}</div>
{/if}