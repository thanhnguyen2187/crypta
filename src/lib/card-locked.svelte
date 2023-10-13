<script lang="ts">
  import IconClipboardIon from '../svg/icon-clipboard-ion-24.svelte'
  import IconLock from '../svg/icon-lock-ion-128.svelte'
  import IconUnlock from '../svg/icon-unlock-ion-128.svelte'
  import IconTrashIon from '../svg/icon-trash-ion-24.svelte'
  import IconExpandIon from '../svg/icon-expand-ion-24.svelte'
  import IconLockIon from '../svg/icon-lock-ion-24.svelte'
  import IconEye from '../svg/icon-eye-ion-24.svelte'
  import IconEyeOff from '../svg/icon-eye-off-ion-24.svelte'
  import IconEnter from '../svg/icon-enter-ion-24.svelte'
  import IconExit from '../svg/icon-exit-ion-24.svelte'
  import { showToaster } from './toaster.ts'
  import {
    dialogStateStore,
    dialogActionStore,
    dialogPasswordStore,
    getCurrentPassword,
    promptPassword
  } from '$lib/dialog'
  import type { MouseState, ContentState } from './card-locked'
  import { fade } from 'svelte/transition'
  import { attemptDecrypt } from './card-locked'
  import IconCopyIon from '../svg/icon-copy-ion-24.svelte'
  import { type Card, replaceCard, toUnlockedCard } from './card'

  let mouseState: MouseState = 'default'
  let contentState: ContentState = 'locked'
  let contentHoveredOn = false
  let decryptedContent = ''

  export let card: Card = {
    id: '',
    title: '',
    language: '',
    content: '',
    encrypted: false,
    state: 'default',
  }
  export let removalCallback: () => void = () => {}

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      showToaster('Copied successfully!')
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  async function attemptUnlock() {
    const decryptedText = await attemptDecrypt(card.content, getCurrentPassword())
    if (!decryptedText) {
      showToaster(`Unable to unlock snippet "${card.title}"`)
    } else {
      contentState = 'unlocked'
      showToaster(`Unlocked snippet "${card.title}"!`)
      decryptedContent = decryptedText
    }
  }

  let shouldShowUnlocked = false
  let shouldShowLocked = true
  $: {
    shouldShowUnlocked = mouseState === 'hovered' || contentState === 'unlocked'
    shouldShowLocked = mouseState === 'default' || contentState === 'locked'
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
  class="flex flex-col w-80 border-2 rounded-2xl bg-gray-100 relative"
>
  <div
    class="absolute left-0 right-0 top-0 bottom-0 m-auto opacity-25 z-10"
    class:cursor-pointer={shouldShowLocked}
    class:invisible={contentState === 'visible'}
    style="width: 128px; height: 128px;"
    on:mouseenter={() => { mouseState = 'hovered' }}
    on:click={async () => {
      promptPassword(attemptUnlock)
    }}
    on:mouseleave={() => { mouseState = 'default' }}
  >
    {#if shouldShowUnlocked}
      <IconUnlock/>
    {:else if shouldShowLocked}
      <IconLock/>
    {:else}
    {/if}
  </div>
  <div
    class="flex justify-between"
  >
    <input
      class="m-2 px-2 border-2 rounded-xl w-2/3"
      value="{card.title}"
    />
    <div class="mr-2 my-3 gap-1 flex opacity-25">
      {#if contentState !== 'locked'}
        <button><IconExpandIon/></button>
        {#if contentState === 'visible'}
          <button
            on:click={() => contentState = 'unlocked'}
          >
            <IconEyeOff/>
          </button>
        {:else if contentState === 'unlocked'}
          <button
            on:click={() => contentState = 'visible'}
          >
            <IconEye/>
          </button>
        {/if}
      {/if}
      <button on:click={() => {removalCallback()}}><IconTrashIon/></button>
    </div>
  </div>
  <div
    class="flex flex-col relative"
    on:mouseover={() => {contentHoveredOn = true}}
    on:mouseleave={() => {contentHoveredOn = false}}
  >
    {#if contentHoveredOn && contentState === 'visible'}
      <button
        transition:fade={{duration: 400}}
        class="absolute cursor-text select-text right-0 mt-2 mr-2 px-2 border-2 rounded-l bg-white"
      >
        {card.language}
      </button>
      <button
        transition:fade={{duration: 400}}
        class="absolute cursor-pointer right-0 bottom-2 mt-2 mr-2 px-2 py-1 border-2 rounded-l bg-white"
        on:click={copyToClipboard(decryptedContent)}
      >
        <IconCopyIon/>
      </button>
    {/if}
    {#if contentState === 'visible'}
      <textarea
        rows="5"
        class="m-2 border-2 px-1 overflow-scroll font-mono whitespace-pre"
      >{decryptedContent}</textarea>
    {:else}
      <textarea
        rows="5"
        class="m-2 border-2 px-1 overflow-scroll font-mono whitespace-pre invisible"
        disabled="disabled"
      ></textarea>
    {/if}
  </div>
  <div
    class="flex justify-between m-2"
  >
    <div>
    </div>
    <div
      class="flex gap-1 opacity-25"
    >
      <button
        style="transform: rotate(180deg)"
        on:click={async () => {
          switch (contentState) {
            case 'locked':
              $dialogStateStore = 'password'
              $dialogActionStore = async () => {
                await attemptUnlock()
                if (contentState === 'unlocked') {
                  const unlockedCard = {
                    ...card,
                    content: decryptedContent,
                    state: 'default',
                    encrypted: false,
                  }
                  replaceCard(card.id, unlockedCard)
                }
              }
              break
            case 'unlocked':
              const unlockedCard = {
                ...card,
                content: decryptedContent,
                state: 'default',
                encrypted: false,
              }
              replaceCard(card.id, unlockedCard)
              break
          }
        }}
      >
        <IconExit/>
      </button>
      <button
        class:hidden={contentState === 'visible'}
        on:click={async () => {
          switch (contentState) {
            case 'locked':
              $dialogStateStore = 'password'
              $dialogActionStore = async () => {
                await attemptUnlock()
                if (contentState === 'unlocked') {
                  await copyToClipboard(decryptedContent)
                }
              }
              break
            case 'unlocked':
              await copyToClipboard(decryptedContent)
              break
          }
        }}
      >
        <IconClipboardIon/>
      </button>
    </div>
  </div>
</div>
