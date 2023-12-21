import { Config } from 'drizzle-kit'

export default {
  schema: './db/schema.ts',
  driver: 'better-sqlite',
  out: './db',
} satisfies Config