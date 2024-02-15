<script lang="ts">
  import { InputChip } from '@skeletonlabs/skeleton'
  import PickableInput from './pickable-input.svelte'
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
            <button class="btn variant-ghost">
              <i class="fa-solid fa-check"></i>
              <span class="font-normal">Pick</span>
            </button>
          </div>
        </th>
        <th>
          <div
            class="flex gap-2 items-center justify-between"
          >
            <button class="btn variant-ghost">
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
            value="local"
            picked={true}
          />
        </td>
        <td>
          <PickableInput
            type="text"
            value="remote"
            picked={false}
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
            value="local language"
            picked={true}
          />
        </td>
        <td>
          <PickableInput
            type="text"
            value="remote language"
            picked={false}
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
            value="remote language"
            picked={true}
          />
        </td>
        <td>
          <PickableInput
            type="textarea"
            value="remote language"
            picked={false}
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
            picked={true}
          />
        </td>
        <td>
          <PickableInput
            type="chips"
            picked={false}
          />
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          ID
        </td>
        <td>
          <input disabled type="text" class="input" value="local-id" />
        </td>
        <td>
          <input disabled type="text" class="input" value="remote-id" />
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          Date Created
        </td>
        <td>
          <input type="text" class="input" />
        </td>
        <td>
          <input type="text" class="input" />
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          Last Updated
        </td>
        <td>
          <input type="text" class="input" />
        </td>
        <td>
          <input type="text" class="input" />
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
