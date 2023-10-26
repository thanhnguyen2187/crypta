<script
  lang="ts"
>
  import IconSettings from '../svg/icon-ion-settings-24.svelte'
  import { promptSettings } from './dialog'
</script>

<div
  class="flex items-center justify-center my-6 gap-4"
>
  <div
    class="border-2 rounded"
  >
    <input
      class="border-2 rounded px-2 w-80"
      placeholder="search here"
    />
  </div>
  <button
    class="cursor-pointer opacity-50 hover:opacity-100"
    on:click={() => promptSettings()}
  >
    <IconSettings/>
  </button>
</div>
