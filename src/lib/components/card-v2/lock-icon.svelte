<script lang="ts">
  let state: 'default' | 'hovered' | 'active' = 'default'
  export let encrypted = false
  export let decryptCallback: () => void = () => {}
</script>

{#if encrypted}
  <button
    on:mouseenter={() => state = 'hovered'}
    on:mousedown={() => state = 'active'}
    on:click={decryptCallback}
    on:mouseup={() => state = 'hovered'}
    on:mouseleave={() => state = 'default'}
    class="w-full p-4 flex justify-center cursor-pointer"
    aria-roledescription="generic"
  >
    <i
      class="fa-solid fa-8x opacity-75"
      class:fa-lock={state === 'default'}
      class:fa-unlock={state === 'hovered' || state === 'active'}
    ></i>
  </button>
{:else}
  <div
    class="w-full p-4 flex justify-center"
  >
    <i
      class="fa-solid fa-unlock fa-8x opacity-75"
    ></i>
  </div>
{/if}


