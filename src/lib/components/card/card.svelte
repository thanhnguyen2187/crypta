<script lang="ts">
  import IconExpandIon from '../../../svg/icon-ion-expand-24.svelte'
  import IconLockIon from '../../../svg/icon-ion-lock-24.svelte'
  import IconTrashIon from '../../../svg/icon-ion-trash-24.svelte'
  import IconCopyIon from '../../../svg/icon-ion-copy-24.svelte'
  import type { Card, CardState } from './card.ts'
  import { fade } from 'svelte/transition'
  import { showToaster } from '../toaster/toaster.ts'
  import { dialogActionStore, dialogPasswordStore, dialogStateStore } from '$lib/components/dialog/dialog';
  import { replaceCard, toLockedCard, updateCard } from './card.ts';

  export let card: Card = {
    id: '',
    title: '',
    content: '',
    language: '',
    state: 'default',
    encrypted: false,
    createdAt: new Date().getDay(),
    updatedAt: new Date().getDay(),
    position: 0,
  }
  export let contentState: 'default' | 'hoveredOn' = 'default'
  export let removalCallback: () => void = () => {}
  export let lockCallback: () => void = () => {}
  let languageTextWidth = 0

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

<div
  class="flex flex-col w-80 border-2 rounded-2xl transition-opacity"
  class:opacity-50={card.state === 'draggedOut'}
>
  <div
    class="flex justify-between"
  >
    <input
      class="m-2 px-2 border-2 rounded-xl w-2/3"
      bind:value="{card.title}"
      on:change={async () => {
        await updateCard(card)
        showToaster('Card updated!')
      }}
    />
    <div class="mr-2 my-3 gap-1 flex">
      <button
        class="opacity-50 hover:opacity-100"
      >
        <IconExpandIon/>
      </button>
      <button
        class="opacity-50 hover:opacity-100"
        on:click={() => {lockCallback()}}
      >
        <IconLockIon/>
      </button>
      <button
        class="opacity-50 hover:opacity-100"
        on:click={() => {confirmRemoval()}}
      >
        <IconTrashIon/>
      </button>
    </div>
  </div>
  <div
    class="flex flex-col relative"
    role="group"
    on:mouseover={() => {contentState = 'hoveredOn'}}
    on:mouseleave={() => {contentState = 'default'}}
  >
    <span
      class="absolute pl-2 pr-3 invisible"
      bind:offsetWidth={languageTextWidth}
    >
      {card.language}
    </span>
    {#if card.state === 'beingHoverOver'}
      <div
        class="absolute h-40 border border-gray"
        style="left: -0.65em"
      ></div>
    {/if}
    {#if contentState === 'hoveredOn'}
      <input
        transition:fade={{duration: 400}}
        class="absolute right-0 mt-2 mr-2 px-2 border-2 rounded-l bg-white"
        bind:value={card.language}
        style="width: {languageTextWidth}px"
        spellcheck="false"
        on:change={async () => {
          if (!card.language) {
            card.language = 'plaintext'
          }
          await updateCard(card)
          showToaster('Card updated!')
        }}
      >
      <button
        transition:fade={{duration: 400}}
        class="absolute cursor-pointer right-0 bottom-2 mt-2 mr-2 px-2 py-1 border-2 rounded-l bg-white opacity-50 hover:opacity-100"
        on:click={copyToClipboard(card.content)}
      >
        <IconCopyIon/>
      </button>
    {/if}
    <textarea
      rows="5"
      class="m-2 border-2 px-1 overflow-scroll font-mono whitespace-pre no-scrollbar"
      bind:value={card.content}
      on:change={async () => {
        await updateCard(card)
        showToaster('Card updated!')
      }}
      spellcheck="false"
    ></textarea>
  </div>
  <div
    class="flex justify-between m-2"
  >
    #tag-1 #tag-2
  </div>
</div>
