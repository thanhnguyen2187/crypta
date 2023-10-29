<script lang="ts">
  import Toaster from '$lib/toaster.svelte'
  import Gallery from '$lib/components/gallery/gallery.svelte'
  import GalleryPrivate from '$lib/components/gallery/gallery-private.svelte'
  import VisibilitySwitcher from '$lib/components/header/visibility-switcher.svelte'
  import FolderSwitcher from '$lib/components/header/folder-switcher.svelte'
  import Dialog from '$lib/components/dialog/dialog.svelte'
  import Header from '$lib/components/header/header.svelte'
  import autoAnimate from '@formkit/auto-animate'

  import { sectionState } from '$lib/store'
</script>

<style>
  :global(.no-scrollbar) {
    overflow: scroll;
  }

  :global(.no-scrollbar)::-webkit-scrollbar {
    width: 0;
    height: 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
</style>

<div
  class="flex justify-between"
>
  <FolderSwitcher/>
  <div
    class="flex flex-col"
    use:autoAnimate
  >
    <Header/>
    {#if $sectionState === 'public'}
      <Gallery/>
    {:else}
      <GalleryPrivate/>
    {/if}
  </div>
  <VisibilitySwitcher/>
</div>

<Toaster/>
<Dialog/>
