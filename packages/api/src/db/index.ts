import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const queryClient = postgres(databaseUrl, { prepare: false });
const db = drizzle(queryClient, { schema });

export { db, queryClient };
