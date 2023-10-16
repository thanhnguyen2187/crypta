<script lang="ts">
  import Toaster from '$lib/toaster.svelte'
  import Gallery from '$lib/gallery.svelte'
  import GalleryPrivate from '$lib/gallery-private.svelte'
  import NextButton from '$lib/next-button.svelte'
  import Dialog from '$lib/dialog.svelte'
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
  use:autoAnimate
  class="flex"
>
  {#if $sectionState === 'public'}
    <Gallery/>
  {:else}
    <GalleryPrivate/>
  {/if}
  <NextButton/>
</div>

<Toaster/>
<Dialog/>
