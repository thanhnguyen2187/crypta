<script
  lang="ts"
>
  import IconSettings from '../svg/icon-settings-ion-48.svelte'

  let hovered = false
</script>

<div
  class="flex items-center justify-between"
>
  <div></div>
  <div
    class="border-2"
  >
    <input
      class="border-2 rounded px-2 w-max"
      placeholder="search here"
    />
  </div>
  <div
    on:mouseenter={() => hovered = true}
    class="w-16 h-16 flex items-center justify-center"
    on:mouseleave={() => hovered = false}
    class:bg-gray-200={hovered}
  >
    <div
      class="opacity-25"
      class:opacity-50={hovered}
    >
      <IconSettings/>
    </div>
  </div>
</div>
