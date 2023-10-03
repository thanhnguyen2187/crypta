<script lang="ts">
  import IconExpandIon from '../svg/icon-expand-ion-24.svelte'
  import IconLockIon from '../svg/icon-lock-ion-24.svelte'
  import IconTrashIon from '../svg/icon-trash-ion-24.svelte'
  import IconCopyIon from '../svg/icon-copy-ion-24.svelte'
  import type { CardState } from './card.ts'
  import { fade } from 'svelte/transition'
  import { toasterText } from './store.ts'

  export let title = 'Clojure'
  export let content = '(println "Hello world")'
  export let language = ''
  export let state: CardState = 'default'
  export let contentState: 'default' | 'hoveredOn' | 'focused' = 'default'
  export let removalCallback: () => {}

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toasterText.set('Copied successfully')
      setTimeout(() => {
        toasterText.set(null)
      }, 1500)
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }
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
    <input
      class="m-2 px-2 border-2 rounded-xl w-2/3"
      value="{title}"
    />
    <div class="mr-2 my-3 gap-1 flex">
      <button class="cursor-pointer"><IconExpandIon/></button>
      <button class="cursor-pointer"><IconLockIon/></button>
      <button
        class="cursor-pointer"
        on:click={() => {removalCallback()}}
      ><IconTrashIon/></button>
    </div>
  </div>
  <div
    class="flex flex-col relative"
    on:mouseover={() => {contentState = 'hoveredOn'}}
    on:mouseleave={() => {contentState = 'default'}}
  >
    {#if contentState === 'hoveredOn'}
      <div
        transition:fade={{duration: 400}}
        class="absolute cursor-text select-text right-0 mt-2 mr-2 px-2 border-2 rounded-l bg-white"
      >
        {language}
      </div>
      <div
        transition:fade={{duration: 400}}
        class="absolute cursor-pointer right-0 bottom-2 mt-2 mr-2 px-2 py-1 border-2 rounded-l bg-white"
        on:click={copyToClipboard(content)}
      >
        <IconCopyIon/>
      </div>
    {/if}
    <textarea
      rows="5"
      class="m-2 border-2 px-1 overflow-scroll font-mono whitespace-pre"
    >{content}</textarea>
  </div>
  <div
    class="flex justify-between m-2"
  >
    #tag-1 #tag-2
  </div>
</div>
