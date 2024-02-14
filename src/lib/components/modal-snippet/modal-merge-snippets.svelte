<script lang="ts">
  import { InputChip } from '@skeletonlabs/skeleton'
</script>

<div class="w-modal table-container">
  <table class="table table-hover">
    <thead>
      <tr>
        <th></th>
        <th>
          <div
            class="flex gap-2 items-center"
          >
            <span>
              Local
            </span>
            <input class="checkbox" type="checkbox" />
          </div>
        </th>
        <th>
          <div
            class="flex gap-2 items-center"
          >
            <span>
              Remote
            </span>
            <input class="checkbox" type="checkbox" />
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
          <input
            disabled type="text" class="input input-success disabled:!opacity-100 disabled:!cursor-pointer"
            value="local value"
          />
        </td>
        <td>
          <input
            disabled type="text" class="input disabled:!opacity-100 disabled:!cursor-pointer"
            value="remote value"
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
          Content
        </td>
        <td>
          <textarea class="textarea"></textarea>
        </td>
        <td>
          <textarea class="textarea"></textarea>
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          Tags
        </td>
        <td>
          <InputChip disabled name=""/>
        </td>
        <td>
          <InputChip disabled name=""/>
        </td>
      </tr>
      <tr>
        <td
          class="!align-middle"
        >
          ID
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
