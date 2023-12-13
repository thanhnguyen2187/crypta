<script lang="ts">
  import { modalSnippetStore } from '$lib/components/modal-snippet/store'
  import { localSnippetsStore } from '$lib/components/card/card'
  import { format } from '$lib/utitlities/date'
  import { onDestroy, onMount } from 'svelte';
  import type { Snippet } from '$lib/utitlities/persistence'
  import { createNewSnippet } from '$lib/utitlities/persistence'
  import { getModalStore, InputChip } from '@skeletonlabs/skeleton'

  const modalStore = getModalStore()
  let snippet: Snippet = createNewSnippet()

  onMount(() => {
    loadFromStore()
  })

  function loadFromStore() {
    // do this to avoid `tags` mutation
    snippet = {
      ...($modalSnippetStore),
      tags: $modalSnippetStore.tags.slice(),
    }
  }

  function upsert() {
    localSnippetsStore.upsert(snippet)
    modalStore.clear()
  }

  function download() {
    const element = document.createElement('a')
    const blob = new Blob([JSON.stringify(snippet)], {type: 'text/json'})
    element.setAttribute('href', URL.createObjectURL(blob))
    element.download = snippet.id + '.json'
    element.click()
    // TODO: should do `URL.revokeObjectURL` later
  }

  function upload() {
    const element = document.createElement('input')
    element.type = 'file'

    element.onchange = async (e: InputEvent) => {
      const target = e.target as HTMLInputElement
      const files = target.files
      if (!files) {
        return
      }
      const file = files[0]

      try {
        const importedSnippet = JSON.parse(await file.text())
        // TODO: add more data checking here
        snippet = {
          ...importedSnippet,
          id: snippet.id,
        }
      } catch (e) {
        modalStore.close()
        modalStore.trigger({
          type: 'alert',
          title: 'Error!',
          body: 'Something wrong happened importing a new snippet! Please check your file.',
        })
      }
    }

    element.click()
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
        disabled={snippet.encrypted}
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
    <button class="btn variant-filled" on:click={upload}>
      <i class="fa-solid fa-file-import"></i>
      <span>Import</span>
    </button>
    <button class="btn variant-filled" on:click={download}>
      <i class="fa-solid fa-file-export"></i>
      <span>Export</span>
    </button>
    <button class="btn variant-filled" on:click={upsert}>
      <i class="fa-solid fa-save"></i>
      <span>Save</span>
    </button>
  </footer>
</div>
