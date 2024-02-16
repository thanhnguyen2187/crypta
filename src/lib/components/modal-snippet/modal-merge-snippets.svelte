<script lang="ts">
  import PickableInput from './pickable-input.svelte'

  import {
    mergeLocalSnippetStore,
    mergeRemoteSnippetStore,
    pickedMapStore,
    setAll,
    setOne,
  } from './store'
  import { format } from '$lib/utitlities/date';
</script>

<div class="card p-4 w-modal table-container">
  <table class="table table-hover">
    <thead>
      <tr>
        <th></th>
        <th>
          <div
            class="flex gap-2 items-center justify-between"
          >
            <button
              class="btn variant-ghost"
              on:click={() => setAll(pickedMapStore, 'local')}
            >
              <i class="fa-solid fa-check"></i>
              <span class="font-normal">Pick</span>
            </button>
          </div>
        </th>
        <th>
          <div
            class="flex gap-2 items-center justify-between"
          >
            <button
              class="btn variant-ghost"
              on:click={() => setAll(pickedMapStore, 'remote')}
            >
              <i class="fa-solid fa-check"></i>
              <span class="font-normal">Pick</span>
            </button>
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td
          class="!align-middle"
        >
          Title
        </td>
        <td
          class="flex gap-2 items-center"
        >
          <PickableInput
            type="text"
            value={$mergeLocalSnippetStore.name}
            picked={$pickedMapStore.name === 'local'}
            pickFn={() => setOne(pickedMapStore, 'name', 'local')}
          />
        </td>
        <td>
          <PickableInput
            type="text"
            value={$mergeRemoteSnippetStore.name}
            picked={$pickedMapStore.name === 'remote'}
            pickFn={() => setOne(pickedMapStore, 'name', 'remote')}
          />
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          Language
        </td>
        <td>
          <PickableInput
            type="text"
            value={$mergeLocalSnippetStore.language}
            picked={$pickedMapStore.language === 'local'}
            pickFn={() => setOne(pickedMapStore, 'language', 'local')}
          />
        </td>
        <td>
          <PickableInput
            type="text"
            value={$mergeRemoteSnippetStore.language}
            picked={$pickedMapStore.language === 'remote'}
            pickFn={() => setOne(pickedMapStore, 'language', 'remote')}
          />
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          Content
        </td>
        <td>
          <PickableInput
            type="textarea"
            value={$mergeLocalSnippetStore.text}
            picked={$pickedMapStore.text === 'local'}
            pickFn={() => setOne(pickedMapStore, 'text', 'local')}
          />
        </td>
        <td>
          <PickableInput
            type="textarea"
            value={$mergeRemoteSnippetStore.text}
            picked={$pickedMapStore.text === 'remote'}
            pickFn={() => setOne(pickedMapStore, 'text', 'remote')}
          />
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          Tags
        </td>
        <td>
          <PickableInput
            type="chips"
            value={$mergeLocalSnippetStore.tags}
            picked={$pickedMapStore.tags === 'local'}
            pickFn={() => setOne(pickedMapStore, 'tags', 'local')}
          />
        </td>
        <td>
          <PickableInput
            type="chips"
            value={$mergeRemoteSnippetStore.tags}
            picked={$pickedMapStore.tags === 'remote'}
            pickFn={() => setOne(pickedMapStore, 'tags', 'remote')}
          />
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          ID
        </td>
        <td colspan="2">
          <input
            disabled
            type="text"
            class="input"
            value={$mergeLocalSnippetStore.id}
          />
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          Date Created
        </td>
        <td colspan="2">
          <input
            disabled
            type="text"
            class="input"
            value={format(new Date($mergeLocalSnippetStore.createdAt))}
          />
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          Last Updated
        </td>
        <td>
          <input
            disabled
            type="text"
            class="input"
            value={format(new Date($mergeLocalSnippetStore.updatedAt))}
          />
        </td>
        <td>
          <input
            disabled
            type="text"
            class="input"
            value={format(new Date($mergeRemoteSnippetStore.updatedAt))}
          />
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <th colspan="2"></th>
        <th>
          <div class="flex gap-2 font-normal justify-end">
            <button class="btn variant-filled">
              <i class="fa-solid fa-code-merge"></i>
              <span>Merge</span>
            </button>
          </div>
        </th>
      </tr>
    </tfoot>
  </table>
</div>
