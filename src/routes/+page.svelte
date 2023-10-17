<script lang="ts">
  import Toaster from '$lib/toaster.svelte'
  import Gallery from '$lib/gallery.svelte'
  import GalleryPrivate from '$lib/gallery-private.svelte'
  import VisibilitySwitcher from '$lib/visibility-switcher.svelte'
  import FolderSwitcher from '$lib/folder-switcher.svelte'
  import Dialog from '$lib/dialog.svelte'
  import Header from '$lib/header.svelte'
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
  class="flex flex-col"
>
  <Header/>
  <div
    class="flex"
    use:autoAnimate
  >
    <FolderSwitcher/>
    {#if $sectionState === 'public'}
      <Gallery/>
    {:else}
      <GalleryPrivate/>
    {/if}
    <VisibilitySwitcher/>
  </div>
</div>

<Toaster/>
<Dialog/>
