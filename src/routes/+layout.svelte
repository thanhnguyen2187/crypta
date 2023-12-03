<script>
  import "../app.postcss";
  import { initializeStores } from '@skeletonlabs/skeleton';
  import '@fortawesome/fontawesome-free/css/fontawesome.css';
  import '@fortawesome/fontawesome-free/css/brands.css';
  import '@fortawesome/fontawesome-free/css/solid.css';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { storePopup } from "@skeletonlabs/skeleton";

  initializeStores();
  storePopup.set({computePosition, autoUpdate, offset, shift, flip, arrow})
</script>

<slot />
