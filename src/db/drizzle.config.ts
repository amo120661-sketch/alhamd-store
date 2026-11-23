import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER;
const password = process.env.SQL_ADMIN_PASSWORD;

if (!supabaseUrl && !sqlHost) {
  throw new Error('SQL_HOST must be set in environment variables.');
}
if (!supabaseUrl && !sqlDbName) {
  throw new Error('SQL_DB_NAME must be set in environment variables.');
}
if (!supabaseUrl && !user) {
  throw new Error('SQL_ADMIN_USER must be set in environment variables.');
}
if (!supabaseUrl && !password) {
  throw new Error('SQL_ADMIN_PASSWORD must be set in environment variables.');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  schemaFilter: ['public'],
  dbCredentials: {
    ...(supabaseUrl ? { url: supabaseUrl } : { host: sqlHost, user, password, database: sqlDbName, ssl: false }),
  },
  verbose: true,
});
