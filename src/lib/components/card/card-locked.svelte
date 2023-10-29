<script lang="ts">
  import IconLock from '../../../svg/icon-ion-lock-128.svelte'
  import IconUnlock from '../../../svg/icon-ion-unlock-128.svelte'
  import IconTrashIon from '../../../svg/icon-ion-trash-24.svelte'
  import IconExpandIon from '../../../svg/icon-ion-expand-24.svelte'
  import IconEye from '../../../svg/icon-ion-eye-24.svelte'
  import IconEyeOff from '../../../svg/icon-ion-eye-off-24.svelte'
  import IconKey from '../../../svg/icon-ion-key-24.svelte'
  import IconCopyIon from '../../../svg/icon-ion-copy-24.svelte'
  import { showToaster } from '../../toaster.ts'
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
  import { type Card, replaceCard, toUnlockedCard } from './card'
  import { attemptCopyToClipboard } from '$lib/clipboard'

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
    position: 0,
  }
  export let removalCallback: () => void = () => {}

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
        <button>
          <IconExpandIon/>
        </button>
        <button
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
                    await replaceCard(card.id, unlockedCard)
                  }
                }
                break
              case 'unlocked':
              case 'visible':
                const unlockedCard = {
                  ...card,
                  content: decryptedContent,
                  state: 'default',
                  encrypted: false,
                }
                await replaceCard(card.id, unlockedCard)
                break
            }
          }}
        >
          <IconKey/>
        </button>
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
        on:click={attemptCopyToClipboard(decryptedContent)}
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
        class:hidden={contentState === 'visible'}
        on:click={async () => {
          switch (contentState) {
            case 'locked':
              $dialogStateStore = 'password'
              $dialogActionStore = async () => {
                await attemptUnlock()
                if (contentState === 'unlocked') {
                  await attemptCopyToClipboard(decryptedContent)
                }
              }
              break
            case 'unlocked':
            case 'visible':
              await attemptCopyToClipboard(decryptedContent)
              break
          }
        }}
      >
        <IconCopyIon/>
      </button>
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
    </div>
  </div>
</div>
