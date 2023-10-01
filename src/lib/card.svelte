<script lang="ts">
  import IconExpandIon from '../svg/icon-expand-ion-24.svelte'
  import IconLockIon from '../svg/icon-lock-ion-24.svelte'
  import IconTrashIon from '../svg/icon-trash-ion-24.svelte'
  import IconCopyIon from '../svg/icon-copy-ion-24.svelte'
  import type { CardState } from '$lib/card'
  import { fade } from 'svelte/transition'

  export let title = 'Clojure'
  export let content = '(println "Hello world")'
  export let language = ''
  export let state: CardState = 'default'
  export let contentState: 'default' | 'hoveredOn' = 'default'
</script>

<style>
  /* Hide scrollbar */
  textarea::-webkit-scrollbar {
    width: 0;
    height: 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .striped {
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      #ccc 10px,
      #ccc 20px
    )
  }
</style>

<div
  class="flex flex-col w-80 border-2 rounded-2xl transition-opacity"
  class:opacity-50={state === 'draggedOut'}
>
  <div
    class="flex justify-between"
  >
    <input class="m-2 px-1 border-2 rounded-xl" value="{title}"/>
    <div class="mr-3 my-3 gap-1 flex">
      <div class="cursor-pointer"><IconExpandIon/></div>
      <div class="cursor-pointer"><IconLockIon/></div>
      <div class="cursor-pointer"><IconTrashIon/></div>
    </div>
  </div>
  <div
    class="flex flex-col relative"
  >
    {#if contentState === 'hoveredOn'}
      <div
        transition:fade
        on:mouseover={() => {}}
        on:mouseleave={() => {}}
        class="absolute right-0 mt-2 mr-2 px-2 border-2 rounded-l bg-white"
      >
        {language}
      </div>
      <div
        transition:fade
        class="absolute right-0 bottom-2 mt-2 mr-2 px-2 py-1 border-2 rounded-l bg-white"
      >
        <IconCopyIon/>
      </div>
    {/if}
    <textarea
      rows="5"
      class="m-2 border-2 px-1 overflow-scroll font-mono whitespace-pre"
      on:mouseover={() => {contentState = 'hoveredOn'}}
      on:mouseleave={() => {contentState = 'default'}}
    >{content}</textarea>
  </div>
  <div
    class="flex justify-between m-2"
  >
    #tag-1 #tag-2
  </div>
</div>
