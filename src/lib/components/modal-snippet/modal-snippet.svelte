<script lang="ts">
  import { modalSnippetStore } from '$lib/components/modal-snippet/store'
  import { localSnippetStore } from '$lib/components/card/card'
  import { format } from '$lib/utitlities/date'
  import { getModalStore } from '@skeletonlabs/skeleton'

  const modalStore = getModalStore()

  function upsert() {
    localSnippetStore.upsert($modalSnippetStore)
    modalStore.clear()
  }
</script>

<div
  class="card w-modal-wide"
>
  <section class="m-4 flex flex-col gap-2">
    <label class="label">
      <span>Title</span>
      <input class="input" bind:value={$modalSnippetStore.name} spellcheck="false" />
    </label>
    <label class="label">
      <span>Language</span>
      <input class="input" bind:value={$modalSnippetStore.language} spellcheck="false" />
    </label>
    <label class="label">
      <span>Content</span>
      <textarea
        class="textarea"
        rows="8"
        spellcheck="false"
        bind:value={$modalSnippetStore.text}
      ></textarea>
    </label>
    <label class="label">
      <span>ID</span>
      <input class="input" disabled value={$modalSnippetStore.id} />
    </label>
    <label class="label">
      <span>Date created</span>
      <input class="input" disabled value={format(new Date($modalSnippetStore.createdAt))} spellcheck="false" />
    </label>
    <label class="label">
      <span>Last updated</span>
      <input class="input" disabled value={format(new Date($modalSnippetStore.updatedAt))} spellcheck="false" />
    </label>
  </section>
  <footer class="card-footer flex gap-2 justify-end">
    <button class="btn variant-filled" on:click={upsert}>
      <i class="fa-solid fa-save"></i>
      <span>Save</span>
    </button>
    <button class="btn variant-filled">
      <i class="fa-solid fa-cancel"></i>
      <span>Cancel</span>
    </button>
  </footer>
</div>