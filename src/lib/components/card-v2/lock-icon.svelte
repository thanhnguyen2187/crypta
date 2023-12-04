<script lang="ts">
  let state: 'default' | 'hovered' | 'active' = 'default'
</script>

<div
  on:mouseenter={() => state = 'hovered'}
  on:mousedown={() => state = 'active'}
  on:mouseup={() => state = 'hovered'}
  on:mouseleave={() => state = 'default'}
  class="w-full p-4 flex justify-center cursor-pointer"
>
  <i
    class="fa-solid fa-8x opacity-75"
    class:fa-lock={state === 'default'}
    class:fa-unlock={state === 'hovered' || state === 'active'}
  ></i>
</div>

