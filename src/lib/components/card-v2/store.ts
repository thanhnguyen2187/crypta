import { derived } from 'svelte/store'
import { globalStateStore } from '$lib/utitlities/global'
import { localDb } from '$lib/sqlite/global'
import { migrationStateStore } from '$lib/sqlite/migration'
import { createLocalSnippetStoreV2 } from '$lib/sqlite/wa-sqlite'

export const localSnippetsStore = await createLocalSnippetStoreV2(migrationStateStore, globalStateStore, localDb)
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
        return snippet2.updatedAt - snippet1.updatedAt
      }
    )
    return filteredSnippets
  }
)
