<script lang="ts">
  import { CodeBlock, getModalStore, popup } from '@skeletonlabs/skeleton'
  import type { Snippet } from '$lib/utitlities/persistence'
  import LockIcon from './lock-icon.svelte'
  import { localSnippetStore } from '$lib/components/card/card';
  import { createNewSnippet } from '$lib/utitlities/persistence'
  import { modalSnippetStore } from '$lib/components/modal-snippet/store'

  const modalStore = getModalStore()

  export let snippet: Snippet = {
    id: '',
    name: '',
    language: '',
    text: '',
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
      callback: () => {},
    },
    {
      text: 'Duplicate',
      faIconClass: 'fa-copy',
      callback: () => localSnippetStore.clone(snippet),
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
              localSnippetStore.remove(snippet.id)
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
      class="m-4 h-40 overflow-y-scroll hide-scrollbar"
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
    <footer class="card-footer">
      <span class="chip variant-filled-primary">Tag 1</span>
      <span class="chip variant-filled-primary">Tag 2</span>
    </footer>
  {:else}
    <header
      class="card-header flex gap-4 justify-between invisible"
    >
      <h3 class="h3">Placeholder</h3>
    </header>
    <section class="m-4 h-40 flex flex-col justify-center items-center">
      <button class="btn variant-filled" on:click={() => localSnippetStore.upsert(createNewSnippet())}>
        <i class="fa-solid fa-add fa-9x"></i>
      </button>
    </section>
  {/if}
</div>