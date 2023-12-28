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
    name: text('name').notNull(),
    language: text('language').notNull(),
    text: text('text').notNull(),
    encrypted: integer('encrypted', {mode: 'boolean'}).default(false).notNull(),
    position: real('position').default(1).notNull(),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
)

export const folders = sqliteTable(
  'folders',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    position: real('position').default(1).notNull(),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
)

export const snippet_tags = sqliteTable(
  'snippet_tags',
  {
    id: text('id').primaryKey(),
    snippetId: text('snippet_id').references(
      () => snippets.id,
      {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
    ).notNull(),
    tagText: text('tag_text').notNull(),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => ({
    unq: unique('unique__snippet_id__tag_text').on(t.snippetId, t.tagText),
  })
)

