<script lang="ts">
  import { CodeBlock, getModalStore, popup, clipboard } from '@skeletonlabs/skeleton'
  import type { Snippet } from '$lib/utitlities/persistence'
  import LockIcon from './lock-icon.svelte'
  import { localSnippetsStore } from '$lib/components/card/card';
  import { createNewSnippet, encryptSnippet, decryptSnippet } from '$lib/utitlities/persistence'
  import { modalSnippetStore } from '$lib/components/modal-snippet/store'
  import { globalTagsStore } from '$lib/utitlities/ephemera';
  import { lockerShowWarningStore } from '$lib/components/modal-locker/store'
  import { fade } from 'svelte/transition'
  import { getFromClipboard } from '$lib/utitlities/clipboard';

  const modalStore = getModalStore()
  let state: 'default' | 'locked' | 'unlocked' = 'default'
  let unlockedVisibility: 'hidden' | 'visible' = 'hidden'
  let hiddenCopyClass = 'fa-copy'

  export let snippet: Snippet = {
    id: '',
    name: '',
    language: '',
    text: '',
    tags: [],
    encrypted: false,
    position: 0,
    createdAt: 0,
    updatedAt: 0,
  }

  type CardAction = {
    text: string
    faIconClass: string
    callback: () => void
  }
  const actionLock: CardAction = {
    text: 'Encrypt',
    faIconClass: 'fa-lock',
    callback: () => {
      $lockerShowWarningStore = true
      modalStore.trigger({
        type: 'component',
        component: 'locker',
        response: (data: {password: string} | undefined) => {
          if (!data) {
            return
          }
          const {password} = data

          encryptSnippet(snippet, password).then(
            lockedSnippet => localSnippetsStore.upsert(lockedSnippet)
          )
        },
      })
    },
  }
  const actionDecrypt: CardAction = {
    text: 'Decrypt',
    faIconClass: 'fa-unlock',
    callback: () => {
      $lockerShowWarningStore = false
      modalStore.trigger({
        type: 'component',
        component: 'locker',
        response: (data: {password: string} | undefined) => {
          if (!data) {
            return
          }
          const {password} = data

          decryptSnippet(snippet, password).then(
            unlockedSnippet => {
              state = 'unlocked'
              snippet = {...unlockedSnippet}
            }
          ).catch(e => {
            console.error(e)
            setTimeout(() => modalStore.trigger({
              type: 'alert',
              title: 'Unable to decrypt the card',
              body: 'Please recheck your password!',
            }), 500)
          })
        },
      })
    },
  }
  const actionUnlock: CardAction = {
    text: 'Unlock',
    faIconClass: 'fa-key',
    callback: () => {
      $lockerShowWarningStore = false
      modalStore.trigger({
        type: 'component',
        component: 'locker',
        response: (data: {password: string} | undefined) => {
          if (!data) {
            return
          }
          const {password} = data

          decryptSnippet(snippet, password).then(
            unlockedSnippet => {
              state = 'default'
              localSnippetsStore.upsert(unlockedSnippet)
            }
          ).catch(e => {
            console.error(e)
            setTimeout(() => modalStore.trigger({
              type: 'alert',
              title: 'Unable to unlock the card',
              body: 'Please recheck your password!',
            }), 500)
          })
        },
      })
    },
  }
  const actionDuplicate: CardAction = {
    text: 'Duplicate',
    faIconClass: 'fa-clone',
    callback: () => localSnippetsStore.clone(snippet),
  }
  const actionEdit: CardAction = {
    text: 'Edit',
    faIconClass: 'fa-edit',
    callback: () => {
      modalSnippetStore.set(snippet)
      modalStore.trigger({
        type: 'component',
        component: 'snippet',
      })
    },
  }
  const actionChangeFolder: CardAction = {
    text: 'Move',
    faIconClass: 'fa-arrow-up-from-bracket',
    callback: () => {
      modalSnippetStore.set(snippet)
      modalStore.trigger({
        type: 'component',
        component: 'moveSnippet',
      })
    },
  }
  const actionDelete: CardAction = {
    text: 'Delete',
    faIconClass: 'fa-trash',
    callback: () => {
      modalStore.trigger({
        type: 'confirm',
        title: 'Are you sure about this action?',
        body: 'The record would be deleted completely!',
        response: (r: boolean) => {
          if (r) {
            localSnippetsStore.remove(snippet.id)
          }
        }
      })
    },
  }

  const defaultCardActions: CardAction[] = [
    actionLock,
    actionEdit,
    actionDuplicate,
    actionChangeFolder,
    actionDelete,
  ]
  const lockedCardActions: CardAction[] = [
    actionDecrypt,
    actionUnlock,
    actionChangeFolder,
    actionDelete,
  ]

  let cardActions: CardAction[] = []
  $: {
    cardActions = snippet.encrypted
      ? lockedCardActions
      : defaultCardActions
  }

  async function create() {
    const snippet = createNewSnippet()
    let text = await getFromClipboard()
    if (!text) {
      text = 'To be filled'
    }

    snippet.text = text
    await localSnippetsStore.upsert(snippet)
  }
</script>

<div
  data-popup="card-actions-{snippet.id}"
  class="z-10"
>
  <!--Use `z-10` to make it displays above AppShell-->
  <ul class="list-nav variant-filled gap-2 rounded-container-token">
    {#each cardActions as cardAction}
      <li>
        <button class="w-full" on:click={() => cardAction.callback()}>
          <span>
            <i class="fa-solid {cardAction.faIconClass}"></i>
          </span>
          <span>{cardAction.text}</span>
        </button>
      </li>
    {/each}
  </ul>
</div>

<div
  class="card p-4"
>
  {#if snippet.id !== 'new-card'}
    <header
      class="card-header flex gap-4 justify-between"
    >
      <h3 class="h3 truncate">{snippet.name}</h3>
      <div class="flex gap-1">
        {#if state === 'unlocked' && unlockedVisibility === 'hidden'}
          <button
            class="btn btn-sm variant-filled"
            use:clipboard={snippet.text}
            on:click={() => {
              hiddenCopyClass = 'fa-check'
              setTimeout(() => hiddenCopyClass = 'fa-copy', 1000)
            }}
          >
            <i class="fa-solid {hiddenCopyClass}"></i>
          </button>
          <button
            class="btn btn-sm variant-filled"
            on:click={() => unlockedVisibility = 'visible'}
          >
            <i class="fa-solid fa-eye"></i>
          </button>
        {:else if state === 'unlocked' && unlockedVisibility === 'visible'}
          <button
            class="btn btn-sm variant-filled"
            on:click={() => unlockedVisibility = 'hidden'}
          >
            <i class="fa-solid fa-eye-slash"></i>
          </button>
        {/if}
        <button
          use:popup={{
            event: 'click',
            target: 'card-actions-' + snippet.id,
            placement: 'right',
          }}
          class="btn btn-sm variant-filled"
        >
          <i class="fa-xl fa-solid fa-ellipsis-v"></i>
        </button>
      </div>
    </header>
    <section
      class="m-4 h-40 overflow-y-scroll hide-scrollbar"
    >
      {#if (state !== 'default' || snippet.encrypted) && unlockedVisibility === 'hidden'}
        <LockIcon
          encrypted={snippet.encrypted}
          decryptCallback={actionDecrypt.callback}
        />
      {:else if state === 'default' || unlockedVisibility === 'visible'}
        <CodeBlock
          buttonLabel="Copy"
          buttonCopied="✔️"
          language={snippet.language}
          code={snippet.text}
        />
      {/if}
    </section>
    <footer class="card-footer flex gap-1">
      {#each snippet.tags as tag}
        <span
          class="chip variant-filled"
          on:click={() => globalTagsStore.add(tag)}
        >{tag}</span>
      {/each}

      {#if snippet.tags.length === 0}
        <span class="chip variant-ghost">no tag yet</span>
      {/if}
    </footer>
  {:else}
    <header
      class="card-header flex gap-4 justify-between invisible"
    >
      <h3 class="h3 truncate">Placeholder</h3>
    </header>
    <section class="m-4 h-40 flex flex-col justify-center items-center">
      <button class="btn variant-filled" on:click={create}>
        <i class="fa-solid fa-add fa-9x"></i>
      </button>
    </section>
    <footer class="card-footer invisible">
      <span class="chip variant-ghost">no tag yet</span>
    </footer>
  {/if}
</div>
