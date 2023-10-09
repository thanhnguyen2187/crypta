<script lang="ts">
  import { dialogStore } from '$lib/dialog'
</script>

<div class="fixed left-0 top-0">
  {#if $dialogStore !== 'hidden'}
    <div
      class="absolute w-screen h-screen left-0 top-0 bg-black opacity-25 transition-opacity"
      on:click={() => {
        $dialogStore = 'hidden'
      }}
    ></div>
  {/if}
  {#if $dialogStore === 'confirm'}
    <div>Hello world</div>
  {/if}
</div>
