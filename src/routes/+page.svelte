<script lang="ts">
  import {
    AppBar,
    AppShell,
    AppRail,
    AppRailTile,
    AppRailAnchor,
    CodeBlock,
    popup,
  } from '@skeletonlabs/skeleton'
  import type { PopupSettings } from '@skeletonlabs/skeleton'

  let currentTile: number = 0

  const popupClick: PopupSettings = {
    event: 'click',
    target: 'popupClick2',
    placement: 'right',
  }

  const veryLongText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque posuere turpis ac porttitor ornare. Pellentesque laoreet tincidunt ullamcorper. Praesent sagittis posuere mauris, et interdum ligula tempus eu. Ut venenatis, purus eget mattis malesuada, tortor nunc dignissim neque, ut aliquet felis augue nec nulla. Mauris ullamcorper molestie lacinia. Nam vitae augue a nunc rutrum volutpat. Curabitur sed venenatis nulla, at vulputate diam. Proin pellentesque iaculis tortor, et sagittis sem vestibulum vel.

Nulla ut semper quam. Mauris eu arcu et odio suscipit efficitur. Ut eu finibus tellus. Vivamus eget magna mattis, consequat justo nec, placerat sem. Morbi eros ex, bibendum non nisl in, mattis feugiat risus. Fusce vitae pulvinar lectus. Proin dapibus libero nec dolor iaculis rutrum. Maecenas ornare est vel tempus rutrum. Etiam justo risus, semper nec convallis ut, consectetur sed quam. Aenean sed risus eros. Integer tincidunt, lacus ac venenatis ornare, ligula ipsum feugiat libero, vitae feugiat libero erat quis risus. Nulla nec placerat leo. Suspendisse rutrum sem et laoreet pretium. Proin molestie odio eu mauris dapibus, in dignissim sem mollis.

Duis in orci quis nisi blandit aliquam ac ut lectus. Aenean ex lacus, bibendum sed sapien ac, porttitor mollis eros. Ut pretium arcu dui, ut mollis est maximus in. Praesent in lobortis arcu, ut bibendum neque. Donec id lobortis velit. Sed sollicitudin massa sit amet velit blandit gravida. Vivamus nec molestie felis. Nunc nulla turpis, euismod a ornare in, aliquet sed nulla. Integer efficitur velit vel leo maximus, nec ultricies risus sagittis. Etiam at lacus neque. Donec aliquet, mauris ac pellentesque sollicitudin, sem est mattis libero, eget luctus tellus augue at augue. Etiam porttitor ipsum vitae faucibus ultrices. Donec facilisis nibh vitae libero rutrum, porttitor fermentum velit aliquet. Nulla sed felis vel purus ultrices elementum.

Morbi nec dolor pellentesque, interdum massa nec, auctor risus. Proin diam velit, maximus at porta rutrum, posuere vel eros. Aenean et tempus diam, vitae varius tortor. Cras molestie bibendum orci, et iaculis nisl ullamcorper vel. Duis ut volutpat erat. Donec at erat ac sem aliquet pulvinar. Phasellus venenatis, odio ac lacinia interdum, turpis mauris lobortis quam, eu vehicula purus elit in justo.

Duis a neque vel mi volutpat ornare quis vitae odio. Etiam volutpat ultricies tellus, at viverra nisi finibus vel. Praesent cursus ullamcorper odio, eu aliquet magna convallis in. Quisque neque elit, convallis eget purus vel, eleifend luctus quam. Nam ut libero eu odio rutrum dapibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum enim erat, mattis id tincidunt nec, pellentesque at nibh. Donec vel purus pulvinar, ultricies elit in, pharetra neque. Vestibulum sed ante nibh. Praesent gravida ligula nunc, id faucibus massa gravida in. Praesent eu lacus vel tellus sagittis maximus. Donec nec metus porta, cursus est vel, sodales lectus. Proin sodales posuere nibh.`
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
          use:popup={{
            event: 'hover',
            target: 'tooltip-sort',
            placement: 'bottom',
          }}
        >
          <i class="fa-xl fa-solid fa-sort"></i>
        </button>
        <button
          class="btn-icon variant-filled"
          use:popup={{
            event: 'hover',
            target: 'tooltip-settings',
            placement: 'bottom',
          }}
        >
          <i class="fa-xl fa-solid fa-gear"></i>
        </button>
      </svelte:fragment>
      <div
        data-popup="tooltip-sort"
        class="card p-2 variant-filled-tertiary [&>*]:pointer-events-none"
      >
        Sort
        <div class="arrow variant-filled-tertiary"></div>
      </div>
      <div
        data-popup="tooltip-settings"
        class="card p-2 variant-filled-tertiary [&>*]:pointer-events-none"
      >
        Settings
        <div class="arrow variant-filled-tertiary"></div>
      </div>
    </AppBar>
  </svelte:fragment>
  <div
    class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    <div
      class="card p-4"
    >
      <header
        class="card-header flex gap-4 justify-between"
      >
        <h3 class="h3">Card title</h3>
        <button
          use:popup={popupClick}
          class="btn btn-sm variant-filled"
        >
          <i class="fa-xl fa-solid fa-ellipsis-v"></i>
        </button>
        <div data-popup="popupClick2">
          <ul class="list-nav variant-filled gap-2 rounded-container-token">
            <li>
              <button class="w-full">
                <span>
                  <i class="fa-solid fa-edit"></i>
                </span>
                <span>Edit</span>
              </button>
            </li>
            <li>
              <button class="w-full">
                <span>
                  <i class="fa-solid fa-copy"></i>
                </span>
                <span>Duplicate</span>
              </button>
            </li>
            <li>
              <button class="w-full">
                <span>
                  <i class="fa-solid fa-trash"></i>
                </span>
                <span>Delete</span>
              </button>
            </li>
          </ul>
        </div>
      </header>
      <section
        class="p-4"
      >
        <CodeBlock
          code={veryLongText}
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
      <AppRailTile bind:group={currentTile} name="0" value={0}>Default</AppRailTile>
      <AppRailTile bind:group={currentTile} name="1" value={1}>Company</AppRailTile>
      <AppRailTile bind:group={currentTile} name="2" value={2}>Personal</AppRailTile>
      <AppRailTile bind:group={currentTile} name="3" value={3}>
        <i class="fa-xl fa-solid fa-add"></i>
      </AppRailTile>
    </AppRail>
  </svelte:fragment>
</AppShell>
