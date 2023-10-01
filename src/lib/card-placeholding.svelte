<script lang="ts">
  import IconExpandIon from '../svg/icon-expand-ion-24.svelte'
  import IconLockIon from '../svg/icon-lock-ion-24.svelte'
  import IconTrashIon from '../svg/icon-trash-ion-24.svelte'
  import IconCopyIon from '../svg/icon-copy-ion-24.svelte'
  import IconClipboardIon from '../svg/icon-clipboard-ion-24.svelte'

  export let title = 'Sample Clojure'
  export let content = '(println "Hello world")'
</script>

<div
  class="flex flex-col w-80 border-2 rounded-2xl bg-gray-100"
>
  <div
    class="flex justify-between"
  >
    <input class="m-2 px-1 border-2 rounded-xl" value="{title}" disabled="disabled"/>
    <div class="mr-3 my-3 gap-1 flex">
    </div>
  </div>
  <div
    class="flex flex-col relative"
  >
    <div
      class="absolute right-0 mt-2 mr-2 px-2 border-2 rounded-l"
    >
      Clojure
    </div>
    <textarea rows="5" class="m-2 border-2 px-1" disabled="disabled">{content}</textarea>
  </div>
  <div
    class="flex justify-between m-2"
  >
    <div>
    </div>
    <div
      class="flex gap-1 mr-1"
    >
      <IconClipboardIon/>
    </div>
  </div>
</div>
