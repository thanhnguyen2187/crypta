<script lang="ts">
  import { SlideToggle } from '@skeletonlabs/skeleton'
</script>

<div
  class="card"
>
  <div class="p-4 flex flex-col gap-4">
    <label class="label">
      <span>Folder name</span>
      <input class="input" type="text" placeholder="Default"/>
    </label>
    <SlideToggle name="showLockedCards">Show locked cards</SlideToggle>
    <div
      class="flex gap-4"
    >
      <button
        class="btn variant-filled"
      >
        <i class="fa-solid fa-download"></i>
        <span>Download</span>
      </button>
      <button
        class="btn variant-filled"
      >
        <i class="fa-solid fa-upload"></i>
        <span>Upload</span>
      </button>
    </div>
  </div>
</div>
