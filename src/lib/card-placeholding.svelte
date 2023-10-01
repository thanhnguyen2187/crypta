<script lang="ts">
  import IconClipboardIon from '../svg/icon-clipboard-ion-24.svelte'
  import IconAdd from '../svg/icon-add-ion-256.svelte'
  import IconAddCircle from '../svg/icon-add-circle-ion-128.svelte'

  export let title = 'Sample Clojure'
  export let content = '(println "Hello world")'
</script>

<style>
  /* Hide scrollbar */
  textarea::-webkit-scrollbar {
    width: 0;
    height: 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
</style>

<div
  class="flex flex-col w-80 border-2 rounded-2xl bg-gray-100 relative"
>
  <div
    class="absolute left-0 right-0 top-0 bottom-0 m-auto opacity-25"
    style="width: 128px; height: 128px;"
  >
    <IconAdd/>
  </div>
  <div
    class="flex justify-between invisible"
  >
    <input class="m-2 px-1 border-2 rounded-xl invisible" value="{title}" disabled="disabled"/>
    <div class="mr-3 my-3 gap-1 flex">
    </div>
  </div>
  <div
    class="flex flex-col relative invisible"
  >
    <div
      class="absolute right-0 mt-2 mr-2 px-2 border-2 rounded-l"
    >
      Clojure
    </div>
    <textarea
      rows="5"
      class="m-2 border-2 px-1 overflow-scroll font-mono whitespace-pre"
      disabled="disabled">{content}</textarea>
  </div>
  <div
    class="flex justify-between m-2 invisible"
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
