import type { queryTagsBySnippetIds, querySnippetsByFolderId } from '$lib/sqlite/queries'
import type { Flatten, ValueType } from './typing'

export type TagsMap = {[id: string]: string[]}
export type Tags = ValueType<ReturnType<typeof queryTagsBySnippetIds>>
export type DbSnippet = Flatten<ValueType<ReturnType<typeof querySnippetsByFolderId>>>

export function buildTagsMap(tags: Tags): TagsMap {
  const tagsMap: TagsMap = {}
  for (const tag of tags) {
    if (!tagsMap[tag.snippetId]) {
      tagsMap[tag.snippetId] = [tag.tagText]
      continue
    }
    tagsMap[tag.snippetId].push(tag.tagText)
  }

  return tagsMap
}

export function dbSnippetToDisplaySnippet(dbSnippet: DbSnippet, tagsMap: TagsMap): any {
  return {
    id: dbSnippet.id,
    name: dbSnippet.name,
    language: dbSnippet.language,
    text: dbSnippet.text,
    position: dbSnippet.position,
    encrypted: dbSnippet.encrypted,
    tags: tagsMap[dbSnippet.id] ?? [],
    createdAt: Date.parse(dbSnippet.createdAt),
    updatedAt: Date.parse(dbSnippet.updatedAt),
  }
}
