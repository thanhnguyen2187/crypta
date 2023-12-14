import { derived } from 'svelte/store'
import { globalSearchStore, globalTagsStore } from '$lib/utitlities/ephemera'
import { createLocalSnippetStore } from '$lib/utitlities/persistence'

export const localSnippetsStore = await createLocalSnippetStore()
export const displaySnippetsStore = derived(
  [localSnippetsStore, globalTagsStore, globalSearchStore],
  ([localSnippets, globalTags, globalSearch]) => {
    globalSearch = globalSearch.toLowerCase()
    const filteredSnippets = localSnippets.filter(
      snippet => {
        const snippetTags = new Set(snippet.tags)
        const searchingFound =
          snippet.name.toLowerCase().includes(globalSearch) ||
          snippet.text.toLowerCase().includes(globalSearch)
        // make sure that the snippet's tags include every global tag
        const taggingFound = Array
        .from(globalTags.keys())
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
