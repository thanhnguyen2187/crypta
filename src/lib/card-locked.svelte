<script lang="ts">
  import IconClipboardIon from '../svg/icon-clipboard-ion-24.svelte'
  import IconLock from '../svg/icon-lock-ion-128.svelte'
  import IconUnlock from '../svg/icon-unlock-ion-128.svelte'
  import IconTrashIon from '../svg/icon-trash-ion-24.svelte'
  import { aesGcmDecrypt, aesGcmEncrypt } from './encryption'
  import { toasterTextStore } from './toaster.ts'
  import { dialogStateStore, dialogActionStore, dialogPasswordStore } from '$lib/dialog'

  let buttonState: 'default' | 'hovered' = 'default'
  let attempted = false

  export let removalCallback: () => void = () => {}
  export let title = 'Secret snippet'
  export let language = ''
  export let state = ''
  export let encryptedContent = ''
  export let decryptedContent = ''
  export let password = ''

  async function attemptUnlock(encryptedText: string, password: string): Promise<string | null> {
    try {
      const decryptedText = await aesGcmDecrypt(encryptedText, password)
      return decryptedText
    } catch (e) {
      return null
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
</style>

<div
  class="flex flex-col w-80 border-2 rounded-2xl bg-gray-100 relative"
>
  <div
    class="absolute cursor-pointer left-0 right-0 top-0 bottom-0 m-auto opacity-25 z-10"
    style="width: 128px; height: 128px;"
    on:mouseenter={() => {buttonState = 'hovered'}}
    on:click={() => {
      // attempted = true
      $dialogStateStore = 'password'
      $dialogActionStore = async () => {
        const decryptedText = await attemptUnlock(encryptedContent, $dialogPasswordStore)
        if (!decryptedText) {
          toasterTextStore.set(`Unable to decrypt text of snippet "${title}"`)
          setTimeout(() => {
            toasterTextStore.set(null)
          }, 1500)
        } else {
          decryptedContent = decryptedText
        }
      }
    }}
    on:mouseleave={() => {buttonState = 'default'}}
  >
    {#if buttonState === 'default'}
      <IconLock/>
    {:else}
      <IconUnlock/>
    {/if}
  </div>
  <div
    class="flex justify-between"
  >
    {#if attempted}
      <input
        class="m-2 px-2 border-2 rounded-xl"
        placeholder="Input password here"
        type="password"
        autofocus
        bind:value={password}
        on:focusout={() => {
          attempted = false
          decryptedContent = ''
        }}
        on:keydown={async (e) => {
          if (e.key === 'Enter') {
            const decryptedText = await attemptUnlock(encryptedContent, password)
            if (!decryptedText) {
              toasterTextStore.set(`Unable to decrypt text of snippet "${title}"`)
              setTimeout(() => {
                toasterTextStore.set(null)
              }, 1500)
            } else {
              decryptedContent = decryptedText
            }
          }
        }}
      />
    {:else}
      <input
        class="m-2 px-2 border-2 rounded-xl"
        value="{title}"
      />
    {/if}
    <div class="mr-2 my-3 gap-1 flex">
      <button
        on:click={() => {removalCallback()}}
        class="opacity-25"
      >
        <IconTrashIon/>
      </button>
    </div>
  </div>
  <div
    class="flex flex-col relative"
  >
    {#if decryptedContent}
      <textarea
        rows="5"
        class="m-2 border-2 px-1 overflow-scroll font-mono whitespace-pre"
        disabled="disabled"
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
      class="flex gap-1 mr-1 invisible"
    >
      <IconClipboardIon/>
    </div>
  </div>
</div>
