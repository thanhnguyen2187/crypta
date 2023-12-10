<script lang="ts">
  import { AppRail, AppRailTile } from '@skeletonlabs/skeleton'
  let currentTile = 0
</script>

<AppRail>
  <AppRailTile bind:group={currentTile} name="0" value={0}>Default</AppRailTile>
  <AppRailTile bind:group={currentTile} name="3" value={3}>
    <i class="fa-xl fa-solid fa-add"></i>
  </AppRailTile>
</AppRail>
