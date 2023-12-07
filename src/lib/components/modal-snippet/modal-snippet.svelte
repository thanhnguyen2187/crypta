<script lang="ts">
  import { modalSnippetStore } from '$lib/components/modal-snippet/store'
  import { localSnippetsStore } from '$lib/components/card/card'
  import { format } from '$lib/utitlities/date'
  import { onMount } from 'svelte';
  import type { Snippet } from '$lib/utitlities/persistence'
  import { createNewSnippet } from '$lib/utitlities/persistence'
  import { getModalStore, InputChip } from '@skeletonlabs/skeleton'

  const modalStore = getModalStore()
  let snippet: Snippet = createNewSnippet()

  onMount(() => {
    loadFromStore()
  })

  function loadFromStore() {
    snippet = {
      ...($modalSnippetStore),
      tags: $modalSnippetStore.tags.slice(),
    }
  }

  function upsert() {
    localSnippetsStore.upsert(snippet)
    modalStore.clear()
  }
</script>

<div
  class="card w-modal"
>
  <section class="m-4 flex flex-col gap-2">
    <label class="label">
      <span>Title</span>
      <input class="input" bind:value={snippet.name} spellcheck="false" />
    </label>
    <label class="label">
      <span>Language</span>
      <input class="input" bind:value={snippet.language} spellcheck="false" />
    </label>
    <label class="label">
      <span>Content</span>
      <textarea
        class="textarea"
        rows="8"
        spellcheck="false"
        bind:value={snippet.text}
      ></textarea>
    </label>
    <label>
      <span>Tags</span>
      <InputChip name="tags" value={snippet.tags}/>
    </label>
    <label class="label">
      <span>ID</span>
      <input class="input" disabled value={snippet.id} />
    </label>
    <label class="label">
      <span>Date created</span>
      <input class="input" disabled value={format(new Date(snippet.createdAt))} spellcheck="false" />
    </label>
    <label class="label">
      <span>Last updated</span>
      <input class="input" disabled value={format(new Date(snippet.updatedAt))} spellcheck="false" />
    </label>
  </section>
  <footer class="card-footer flex gap-2 justify-end">
    <button class="btn variant-filled" on:click={loadFromStore}>
      <i class="fa-solid fa-refresh"></i>
      <span>Reload</span>
    </button>
    <button class="btn variant-filled" on:click={upsert}>
      <i class="fa-solid fa-save"></i>
      <span>Save</span>
    </button>
  </footer>
</div>
