import { sqliteTable, text, integer, real, } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const snippets = sqliteTable(
  'snippets',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    language: text('language'),
    encrypted: integer('encrypted', {mode: 'boolean'}),
    position: real('position'),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
)

// export const tags = sqliteTable(
//   'tags',
//   {
//     id: text('id').primaryKey(),
//     name: text('name'),
//   },
// )
//
// export const snippet__tag = sqliteTable(
//   'snippet__tag',
//   {
//     id: text('id').primaryKey(),
//   },
// )
