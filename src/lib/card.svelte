<script lang="ts">
  import IconExpandIon from '../svg/icon-expand-ion-24.svelte'
  import IconLockIon from '../svg/icon-lock-ion-24.svelte'
  import IconTrashIon from '../svg/icon-trash-ion-24.svelte'
  import IconCopyIon from '../svg/icon-copy-ion-24.svelte'
  import IconCheckbox from '../svg/icon-checkbox-ion-24.svelte'
  import IconCheckmark from '../svg/icon-checkmark-ion-24.svelte'
  import type { CardState } from './card.ts'
  import { fade } from 'svelte/transition'
  import { showToaster, toasterTextStore } from './toaster.ts'
  import { dialogActionStore, dialogStateStore } from '$lib/dialog';

  export let title = 'Clojure'
  export let content = '(println "Hello world")'
  export let language = ''
  export let state: CardState = 'default'
  export let contentState: 'default' | 'hoveredOn' = 'default'
  export let copySuccess = false
  export let removalCallback: () => void

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      showToaster('Copied successfully!')
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  function confirmRemoval() {
    $dialogActionStore = removalCallback
    $dialogStateStore = 'confirm'
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
      <button><IconExpandIon/></button>
      <button><IconLockIon/></button>
      <button on:click={() => {confirmRemoval()}}><IconTrashIon/></button>
    </div>
  </div>
  <div
    class="flex flex-col relative"
    role="group"
    on:mouseover={() => {contentState = 'hoveredOn'}}
    on:mouseleave={() => {contentState = 'default'}}
  >
    {#if state === 'beingHoverOver'}
      <div
        class="absolute h-40 border border-gray"
        style="left: -0.65em"
      ></div>
    {/if}
    {#if contentState === 'hoveredOn'}
      <button
        transition:fade={{duration: 400}}
        class="absolute cursor-text select-text right-0 mt-2 mr-2 px-2 border-2 rounded-l bg-white"
      >
        {language}
      </button>
      <button
        transition:fade={{duration: 400}}
        class="absolute cursor-pointer right-0 bottom-2 mt-2 mr-2 px-2 py-1 border-2 rounded-l bg-white"
        on:click={copyToClipboard(content)}
      >
        <IconCopyIon/>
      </button>
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
