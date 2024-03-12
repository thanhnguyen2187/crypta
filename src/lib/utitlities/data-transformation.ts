import type { folders, snippet_tags, snippets } from '$lib/sqlite/schema'

export type DisplaySnippet = {
  id: string
  name: string
  language: string
  text: string
  tags: string[]
  encrypted: boolean
  position: number
  updatedAt: number
  createdAt: number
}

export type DisplayFolder = {
  id: string
  name: string
  position: number
  createdAt: number
  updatedAt: number
}

export type TagsMap = {[id: string]: string[]}
export type Tags = (typeof snippet_tags.$inferSelect)[]
export type DbSnippet = typeof snippets.$inferSelect
export type DbFolder = typeof folders.$inferSelect

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

export function displaySnippetToDbSnippet(folderId: string, displaySnippet: DisplaySnippet): DbSnippet {
  return {
    id: displaySnippet.id,
    language: displaySnippet.language,
    name: displaySnippet.name,
    text: displaySnippet.text,
    position: displaySnippet.position,
    encrypted: displaySnippet.encrypted,
    folderId: folderId,
    createdAt: new Date(displaySnippet.createdAt).toISOString(),
    updatedAt: new Date(displaySnippet.updatedAt).toISOString(),
  }
}

export function dbFolderToDisplayFolder(dbFolder: DbFolder): DisplayFolder {
  return {
    id: dbFolder.id,
    name: dbFolder.name,
    position: dbFolder.position,
    createdAt: Date.parse(dbFolder.createdAt),
    updatedAt: Date.parse(dbFolder.updatedAt),
  }
}

export function displayFolderToDbFolder(displayFolder: DisplayFolder): DbFolder {
  return {
    id: displayFolder.id,
    name: displayFolder.name,
    position: displayFolder.position,
    createdAt: new Date(displayFolder.createdAt).toISOString(),
    updatedAt: new Date(displayFolder.updatedAt).toISOString(),
  }
}
