import type { Config } from 'drizzle-kit'

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: 'postgresql://postgres:Alsrjsdl0450!@seuttskwyxmznloukxog.supabase.co:5432/postgres',
  },
} as Config 