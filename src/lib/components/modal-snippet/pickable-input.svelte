<script lang="ts">
  type PickableType = 'text' | 'textarea' | 'chips'

  export let value: string | string[] = ''
  export let type: PickableType = 'text'
  export let picked = false

  export let pickFn = () => {}
</script>

{#if type === 'text'}
  <input
    readonly
    class="input read-only:!cursor-pointer {picked ? 'input-success' : ''}"
    value="{value}"
    on:click={pickFn}
  />
{:else if type === 'textarea'}
  <textarea
    readonly
    rows="6"
    class="textarea read-only:!cursor-pointer {picked ? 'input-success' : ''}"
    on:click={pickFn}
  >{value}</textarea>
{:else if type === 'chips'}
  <button
    class="variant-ghost flex gap-2 p-2 rounded"
    on:click={pickFn}
  >
    {#if value.length > 0}
      {#each value as tag}
        <span
          class="chip {picked ? 'variant-soft-success' : 'variant-soft'} "
        >
          {tag}
        </span>
      {/each}
    {:else}
        <span
          class="chip {picked ? 'variant-soft-success' : 'variant-soft'} "
        >
          no tag yet
        </span>
    {/if}
  </button>
{/if}
