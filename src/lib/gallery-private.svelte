<script lang="ts">
  import { fly } from 'svelte/transition'

</script>

<div
  transition:fly={{x: '-100vw', y: 0}}
>
  Hello world
</div>
