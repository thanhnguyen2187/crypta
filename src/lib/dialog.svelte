<script lang="ts">
  import { dialogStateStore } from '$lib/dialog'
  import { dialogActionStore } from '$lib/dialog'
  import { fade } from 'svelte/transition'
</script>

<div>
  {#if $dialogStateStore !== 'hidden'}
    <div
      class="absolute w-screen h-screen left-0 top-0 bg-black opacity-25"
      transition:fade
      on:click={() => {
        $dialogStateStore = 'hidden'
      }}
    ></div>
  {/if}

  {#if $dialogStateStore === 'confirm'}
    <div
      class="
        fixed
        left-1/2 top-1/2
        -translate-x-1/2 -translate-y-1/2
        flex flex-col
        bg-white
        rounded-xl
        px-4 py-2 border-2 gap-2
      "
    >
      <div>Are you sure you want to do this?</div>
      <div
        class="flex gap-2"
      >
        <button
          class="cursor-pointer px-4 border-2 rounded-xl"
          on:click={() => {
            const action = $dialogActionStore
            action()
          }}
        >Yes</button>
        <button
          class="cursor-pointer px-4 border-2 rounded-xl"
          on:click={() => {
            $dialogStateStore = 'hidden'
          }}
        >No</button>
      </div>
    </div>
  {:else if $dialogStateStore === 'password'}
    <div
      class="
        fixed
        left-1/2 top-1/2
        -translate-x-1/2 -translate-y-1/2
        flex flex-col
        bg-white
        rounded-xl
        px-4 py-2 border-2 gap-2
      "
    >
      <div>Input password here:</div>
      <input type="password" />
    </div>
  {/if}
</div>
