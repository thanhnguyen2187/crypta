<script lang="ts">
  import CardLocked from './card-locked.svelte'
  import CardPlaceHolding from './card-placeholding.svelte'
  import { addNewCard, lockedCardStore, newEmptyCard } from './card.ts'
  import { dialogContentStore, dialogPasswordStore, promptNewPrivateCard } from '$lib/dialog'
  import { attemptGetFromClipboard } from '$lib/clipboard'
  import { aesGcmEncrypt } from '$lib/encryption'
  import autoAnimate from '@formkit/auto-animate'
</script>

<div
  class="container mx-auto my-4 grid grid-cols-4 gap-4 justify-items-center"
  use:autoAnimate
  tabindex="-1"
>
  {#each $lockedCardStore as card, index (card.id)}
    <div
      class="cursor-grab"
    >
      <CardLocked
        card="{card}"
      />
    </div>
  {/each}
  <button
    on:click={async () => {
      promptNewPrivateCard(
        await attemptGetFromClipboard(),
        async () => {
          const card = newEmptyCard()
          card.content = await aesGcmEncrypt($dialogContentStore, $dialogPasswordStore)
          card.encrypted = true

          await addNewCard(card)
        },
      )
    }}
  >
    <CardPlaceHolding/>
  </button>
</div>
