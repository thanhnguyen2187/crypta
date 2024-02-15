<script lang="ts">
  import { InputChip } from '@skeletonlabs/skeleton'

  type PickableType = 'text' | 'textarea' | 'chips'

  export let value = ''
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
{:else if type === 'chips'}
  WIP
{/if}
