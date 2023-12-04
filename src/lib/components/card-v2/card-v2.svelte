<script lang="ts">
  import { CodeBlock, popup } from '@skeletonlabs/skeleton'
  import type { Snippet } from '$lib/utitlities/persistence'
  import LockIcon from './lock-icon.svelte'
  import { localSnippetStore } from '$lib/components/card/card';

  let lockMouseState = 'none' | 'hover' | 'active'
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
      callback: () => {},
    },
    {
      text: 'Delete',
      faIconClass: 'fa-trash',
      callback: () => {},
    },
    {
      text: 'Import',
      faIconClass: 'fa-file-import',
      callback: () => {},
    },
    {
      text: 'Export',
      faIconClass: 'fa-file-export',
      callback: () => {},
    },
  ]
</script>

<div
  class="card p-4"
>
  <header
    class="card-header flex gap-4 justify-between"
  >
    <h3 class="h3">{snippet.name}</h3>
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
            <button class="w-full">
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
  <footer
    class="card-footer"
  >
    <span class="chip variant-filled-primary">
      Tag 1
    </span>
    <span class="chip variant-filled-primary">
      Tag 2
    </span>
  </footer>
</div>
