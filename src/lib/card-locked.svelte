<script lang="ts">
  import IconClipboardIon from '../svg/icon-clipboard-ion-24.svelte'
  import IconLock from '../svg/icon-lock-ion-128.svelte'
  import IconUnlock from '../svg/icon-unlock-ion-128.svelte'
  import IconTrashIon from '../svg/icon-trash-ion-24.svelte'
  import IconExpandIon from '../svg/icon-expand-ion-24.svelte';
  import IconLockIon from '../svg/icon-lock-ion-24.svelte';
  import IconEye from '../svg/icon-eye-ion-24.svelte';
  import IconEyeOff from '../svg/icon-eye-off-ion-24.svelte';
  import { showToaster } from './toaster.ts'
  import { dialogStateStore, dialogActionStore, dialogPasswordStore } from '$lib/dialog'
  import type { MouseState, ContentState } from './card-locked'
  import { fade } from 'svelte/transition'
  import { attemptDecrypt } from './card-locked'
  import IconCopyIon from '../svg/icon-copy-ion-24.svelte';

  let mouseState: MouseState = 'default'
  let contentState: ContentState = 'locked'
  let contentHoveredOn = false

  export let removalCallback: () => void = () => {}
  export let title = 'Secret snippet'
  export let language = ''
  export let state = ''
  export let encryptedContent = ''
  export let decryptedContent = ''
  export let password = ''

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      showToaster('Copied successfully!')
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  async function attemptUnlock() {
    const decryptedText = await attemptDecrypt(encryptedContent, $dialogPasswordStore)
    if (!decryptedText) {
      showToaster(`Unable to unlock snippet "${title}"`)
    } else {
      contentState = 'unlocked'
      showToaster(`Unlocked snippet "${title}"!`)
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
      $dialogStateStore = 'password'
      $dialogActionStore = attemptUnlock
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
      value="{title}"
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
        {language}
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
      class:invisible={contentState === 'visible'}
    >
      <button
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
          }
        }}
      >
        <IconClipboardIon/>
      </button>
    </div>
  </div>
</div>
