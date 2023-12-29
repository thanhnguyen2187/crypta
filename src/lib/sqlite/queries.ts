import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import { snippet_tags, snippets as table_snippets } from '$lib/sqlite/schema';
import { sql } from 'drizzle-orm';

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
