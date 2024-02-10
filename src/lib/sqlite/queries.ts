import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import {
  folders,
  snippet_tags,
  snippets,
} from '$lib/sqlite/schema';
import { sql } from 'drizzle-orm'

export async function querySnippetsByFolderId(db: SqliteRemoteDatabase, folderId: string) {
  return db
    .select({
      createdAt: snippets.createdAt,
      encrypted: snippets.encrypted,
      folderId: snippets.folderId,
      id: snippets.id,
      language: snippets.language,
      name: snippets.name,
      position: snippets.position,
      text: snippets.text,
      updatedAt: snippets.updatedAt,
    })
    .from(snippets)
    .where(sql`folder_id = ${folderId}`)
}

export async function queryTagsBySnippetIds(db: SqliteRemoteDatabase, snippetIds: string[]) {
  return db
    .select()
    .from(snippet_tags)
    .where(sql`snippet_id IN ${snippetIds}`)
}

export async function upsertSnippet(db: SqliteRemoteDatabase, dbSnippet: typeof snippets.$inferInsert) {
  return db
    .insert(snippets)
    .values(dbSnippet)
    .onConflictDoUpdate({
      target: snippets.id,
      set: {
        folderId: sql`excluded.folder_id`,
        encrypted: sql`excluded.encrypted`,
        position: sql`excluded.position`,
        text: sql`excluded.text`,
        name: sql`excluded.name`,
        language: sql`excluded.language`,
        updatedAt: sql`excluded.updated_at`,
      },
    })
}

export async function upsertTags(db: SqliteRemoteDatabase, snippetId: string, tags: string[]) {
  const snippetTagRecords: (typeof snippet_tags.$inferInsert)[] = tags.map(
    tag => ({
      snippetId,
      tagText: tag,
    })
  )
  return db
    .insert(snippet_tags)
    .values(snippetTagRecords)
    .onConflictDoNothing()
}

export async function clearTags(db: SqliteRemoteDatabase, snippetId: string) {
  return db
    .delete(snippet_tags)
    .where(sql`snippet_id = ${snippetId}`)
}

export async function clearAllTags(db: SqliteRemoteDatabase) {
  return db
    .delete(snippet_tags)
}

export async function deleteSnippet(db: SqliteRemoteDatabase, id: string) {
  return db
    .delete(snippets)
    .where(sql`id = ${id}`)
}

export async function deleteSnippetsByFolder(db: SqliteRemoteDatabase, folderId: string) {
  return db
    .delete(snippets)
    .where(sql`folder_id = ${folderId}`)
}

export async function deleteAllSnippets(db: SqliteRemoteDatabase) {
  return db
    .delete(snippets)
}

export async function queryFolders(db: SqliteRemoteDatabase) {
  return db.select().from(folders)
}

export async function upsertFolder(db: SqliteRemoteDatabase, dbFolder: typeof folders.$inferInsert) {
  return db
    .insert(folders)
    .values(dbFolder)
    // .onConflictDoNothing()
    .onConflictDoUpdate({
      target: folders.id,
      set: {
        name: sql`excluded.name`,
        position: sql`excluded.position`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      }
    })
}

export async function deleteFolder(db: SqliteRemoteDatabase, id: string) {
  return db
    .delete(folders)
    .where(sql`id = ${id}`)
}
