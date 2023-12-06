<script lang="ts">
  import { CodeBlock, getModalStore, popup } from '@skeletonlabs/skeleton'
  import type { Snippet } from '$lib/utitlities/persistence'
  import LockIcon from './lock-icon.svelte'
  import { localSnippetsStore } from '$lib/components/card/card';
  import { createNewSnippet } from '$lib/utitlities/persistence'
  import { modalSnippetStore } from '$lib/components/modal-snippet/store'
  import { globalTagsStore } from '../../../routes/global-store';

  const modalStore = getModalStore()

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
  const cardActions: CardAction[] = [
    {
      text: 'Lock',
      faIconClass: 'fa-lock',
      callback: () => {
        modalStore.trigger({
          type: 'component',
          component: 'locker',
        })
      },
    },
    {
      text: 'Duplicate',
      faIconClass: 'fa-copy',
      callback: () => localSnippetsStore.clone(snippet),
    },
    {
      text: 'Edit',
      faIconClass: 'fa-edit',
      callback: () => {
        modalSnippetStore.set(snippet)
        modalStore.trigger({
          type: 'component',
          component: 'snippet',
        })
      },
    },
    {
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
    },
  ]
</script>

<div
  class="card p-4"
>
  {#if snippet.id !== 'new-card'}
    <header
      class="card-header flex gap-4 justify-between"
    >
      <h3 class="h3 truncate">{snippet.name}</h3>
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
    </header>
    <section
      class="m-4 max-h-40 overflow-y-scroll hide-scrollbar"
    >
    {#if !snippet.encrypted}
      <CodeBlock
        language={snippet.language}
        code={snippet.text}
      />
    {:else}
      <LockIcon />
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
    <section class="p-4 h-full flex flex-col justify-center items-center">
      <button class="btn variant-filled" on:click={() => localSnippetsStore.upsert(createNewSnippet())}>
        <i class="fa-solid fa-add fa-9x"></i>
      </button>
    </section>
  {/if}
</div>
