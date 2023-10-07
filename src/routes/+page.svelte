<script lang="ts">
  import Toaster from '$lib/toaster.svelte'
  import Gallery from '$lib/gallery.svelte'
  import GalleryPrivate from '$lib/gallery-private.svelte'
  import NextButton from '$lib/next-button.svelte'

  import { sectionState } from '$lib/store'
</script>

<div
  class="flex"
>
  {#if $sectionState === 'public'}
    <Gallery/>
  {:else}
    <GalleryPrivate/>
  {/if}
  <Toaster/>
  <NextButton/>
</div>

