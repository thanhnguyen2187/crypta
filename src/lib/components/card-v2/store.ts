import { derived } from 'svelte/store'
import { globalStateStore } from '$lib/utitlities/ephemera'
import { createLocalSnippetStore } from '$lib/utitlities/persistence'

export const localSnippetsStore = await createLocalSnippetStore()
export const displaySnippetsStore = derived(
  [localSnippetsStore, globalStateStore],
  ([localSnippets, globalState]) => {
    const filteredSnippets = localSnippets.filter(
      snippet => {
        const snippetTags = new Set(snippet.tags)
        const searchingFound =
          snippet.name.toLowerCase().includes(globalState.searchInput) ||
          snippet.text.toLowerCase().includes(globalState.searchInput)
        // make sure that the snippet's tags include every global tag
        const taggingFound = Array
          .from(globalState.tags)
          .every(globalTag => snippetTags.has(globalTag))
        return searchingFound && taggingFound
      }
    )
    filteredSnippets.sort(
      (snippet1, snippet2) => {
        return snippet1.position - snippet2.position
      }
    )
    return filteredSnippets
  }
)
