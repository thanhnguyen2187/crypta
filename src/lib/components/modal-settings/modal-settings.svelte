<script lang="ts">
  import { settingsStore } from '$lib/utitlities/ephemera'
</script>

<div
  class="card w-modal-slim relative"
>
  <button
    class="badge-icon absolute md:hidden top-2 right-2"
  >
    <i class="fa-xl fa-solid fa-close"></i>
  </button>
  <section class="m-4 flex flex-col gap-2">
    <label class="label">
      <span>Server URL</span>
      <input
        class="input"
        spellcheck="false"
        bind:value={$settingsStore.serverURL}
      />
    </label>
    <label class="label">
      <span>Username</span>
      <input
        class="input"
        spellcheck="false"
        bind:value={$settingsStore.username}
      />
    </label>
    <label class="label">
      <span>Password</span>
      <input
        class="input"
        type="password"
        spellcheck="false"
        bind:value={$settingsStore.password}
      />
    </label>
    <label class="label">
      <span>Logs</span>
      <textarea
        class="textarea font-mono"
        readonly="readonly"
        rows="7"
      >- No server URL detected</textarea>
    </label>
  </section>
  <footer class="card-footer flex gap-2 justify-end">
    <button class="btn variant-filled">
      <i class="fa-solid fa-trash"></i>
      <span>Clear Logs</span>
    </button>
  </footer>
</div>
