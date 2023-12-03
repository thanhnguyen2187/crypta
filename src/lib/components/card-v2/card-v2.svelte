<script lang="ts">
  import { CodeBlock, popup } from '@skeletonlabs/skeleton'
  import type { Snippet } from '$lib/utitlities/persistence';

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
    <div data-popup="card-actions-{snippet.id}">
      <ul class="list-nav variant-filled gap-2 rounded-container-token">
        <li>
          <button class="w-full">
            <span>
              <i class="fa-solid fa-edit"></i>
            </span>
            <span>Edit</span>
          </button>
        </li>
        <li>
          <button class="w-full">
            <span>
              <i class="fa-solid fa-copy"></i>
            </span>
            <span>Duplicate</span>
          </button>
        </li>
        <li>
          <button class="w-full">
            <span>
              <i class="fa-solid fa-trash"></i>
            </span>
            <span>Delete</span>
          </button>
        </li>
      </ul>
    </div>
  </header>
  <section
    class="m-4 h-40 overflow-y-scroll hide-scrollbar"
  >
    <CodeBlock
      language={snippet.language}
      code={snippet.text}
    />
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
