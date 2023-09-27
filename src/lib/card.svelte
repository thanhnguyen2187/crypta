<script lang="ts">
  import IconExpandIon from '../svg/icon-expand-ion-24.svelte'
  import IconLockIon from '../svg/icon-lock-ion-24.svelte'
  import IconTrashIon from '../svg/icon-trash-ion-24.svelte'

  export let title = 'Sample title'
  export let content = 'Sample content'
  export let invisible = false
</script>

<div
  class="flex flex-col w-80 border-2 rounded-2xl {invisible ? 'invisible' : ''}"
>
  <div
    class="flex justify-between"
  >
    <input class="m-2 px-1 border-2 rounded-xl" value="{title}"/>
    <div class="mr-3 my-3 gap-1 flex">
      <IconExpandIon/>
      <IconLockIon/>
      <IconTrashIon/>
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
    <textarea rows="5" class="m-2 border-2 px-1">{content}</textarea>
  </div>
  <div
    class="flex justify-between m-2"
  >
    <div>
      #tag-1 #tag-2
    </div>
    <div>
      Another
    </div>
  </div>
</div>
