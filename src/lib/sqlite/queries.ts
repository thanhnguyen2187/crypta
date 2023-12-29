import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import { snippet_tags, snippets, snippets as table_snippets } from '$lib/sqlite/schema';
import { sql } from 'drizzle-orm'
import type { Flatten, ValueType } from '$lib/utitlities/typing'

export type DbSnippet = Flatten<ValueType<ReturnType<typeof querySnippetsByFolderId>>>

export async function querySnippetsByFolderId(db: SqliteRemoteDatabase, folderId: string) {
  return db
    .select()
    .from(table_snippets)
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
        updatedAt: sql`CURRENT_TIMESTAMP`,
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

export async function deleteSnippet(db: SqliteRemoteDatabase, id: string) {
  return db
    .delete(snippets)
    .where(sql`id = ${id}`)
}
