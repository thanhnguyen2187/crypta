<script
  lang="ts"
>
  import IconSettings from '../svg/icon-ion-settings-24.svelte'

  let hovered = false
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
  <div>
    <IconSettings/>
  </div>
</div>
