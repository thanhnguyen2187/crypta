import { writable } from 'svelte/store'

export const toasterTextStore = writable<string | null>(null)

/* Display a notification text that automatically hides after a short time.
 * */
export function showToaster(text: string, durationMs: number = 1500) {
  toasterTextStore.set(text)
  setTimeout(
    () => {
      toasterTextStore.set(null)
    },
    durationMs,
  )
}
