import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const snippets = sqliteTable(
  'snippets',
  {
    id: text('id').primaryKey(),
    folderId: text('folder_id').references(
      () => folders.id,
      {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
    ),
    name: text('name'),
    language: text('language'),
    encrypted: integer('encrypted', {mode: 'boolean'}),
    position: real('position'),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
)

export const folders = sqliteTable(
  'folders',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    position: real('position'),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
)

export const snippet_tags = sqliteTable(
  'snippet_tags',
  {
    id: text('id').primaryKey(),
    snippet_id: text('snippet_id').references(
      () => snippets.id,
      {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
    ),
    tag_text: text('tag_text'),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    unq: unique('unique__snippet_id__tag_text').on(t.snippet_id, t.tag_text),
  })
)

