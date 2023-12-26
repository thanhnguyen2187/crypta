import { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/sqlite/schema.ts',
  driver: 'better-sqlite',
  out: './db',
} satisfies Config
