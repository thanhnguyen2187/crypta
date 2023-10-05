<script lang="ts">
  import Toaster from '$lib/toaster.svelte'
  import Gallery from '$lib/gallery.svelte'
  import NextButton from '$lib/next-button.svelte'

  import { sectionState } from '$lib/store'
</script>

<Gallery/>
<Toaster/>
<NextButton/>

{$sectionState}

