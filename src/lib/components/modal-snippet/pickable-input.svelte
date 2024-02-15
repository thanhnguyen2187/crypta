<script lang="ts">
  import { globalStateStore } from '$lib/utitlities/global';

  type PickableType = 'text' | 'textarea' | 'chips'

  export let value: string | string[] = ''
  export let type: PickableType = 'text'
  export let picked = false
</script>

{#if type === 'text'}
  <input
    disabled
    class="input disabled:!opacity-100 disabled:!cursor-pointer {picked ? 'input-success' : ''}"
    value="{value}"
  />
{:else if type === 'textarea'}
  <textarea
    disabled
    rows="6"
    class="textarea disabled:!opacity-100 disabled:!cursor-pointer {picked ? 'input-success' : ''}"
  >{value}</textarea>
{:else if type === 'chips' && value.length > 0}
  <button
    class="variant-ghost flex gap-2 p-2 rounded"
  >
    {#each value as tag}
      <span
        class="chip {picked ? 'variant-soft-success' : 'variant-soft'} "
      >
        {tag}
      </span>
    {/each}
  </button>
{/if}
