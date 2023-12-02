<script lang="ts">
  import { AppBar, AppShell, AppRail, AppRailTile, AppRailAnchor, CodeBlock } from '@skeletonlabs/skeleton'

  let currentTile: number = 0
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

<AppShell
>
  <svelte:fragment slot="header">
    <AppBar gridColumns="grid-cols-3">
      <svelte:fragment slot="lead">
        <div></div>
      </svelte:fragment>
      <input class="input" type="text" placeholder="Search here..."/>
      <svelte:fragment slot="trail">
        <button
          class="btn-icon variant-filled"
        >
          <i class="fa-xl fa-solid fa-gear"></i>
        </button>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <div
    class="p-4 grid grid-cols-4 gap-4"
  >
    <div
      class="card p-4"
    >
      <header
        class="card-header flex gap-4 justify-between"
      >
        <h3 class="h3">Card title</h3>
        <button
          class="btn btn-sm variant-filled"
        >
          <i class="fa-xl fa-solid fa-ellipsis-v"></i>
        </button>
      </header>
      <section
        class="p-4"
      >
        <CodeBlock
          code="(println 'Hello world')"
        />
      </section>
      <footer
        class="card-footer"
      >
        <span class="chip variant-filled">
          Tag 1
        </span>
        <span class="chip variant-filled">
          Tag 2
        </span>
      </footer>
    </div>
    <div
      class="card p-4 class-hover"
    >Basic</div>
    <div
      class="card p-4 class-hover"
    >Basic</div>
  </div>
  <svelte:fragment
    slot="sidebarLeft"
  >
    <AppRail>
      <AppRailTile bind:group={currentTile} value={0}>Default</AppRailTile>
      <AppRailTile bind:group={currentTile} value={1}>Company</AppRailTile>
      <AppRailTile bind:group={currentTile} value={2}>Personal</AppRailTile>
      <AppRailTile bind:group={currentTile} value={3}>
        <i class="fa-xl fa-solid fa-add"></i>
      </AppRailTile>
    </AppRail>
  </svelte:fragment>
</AppShell>
