import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const dataConnections = pgTable('data_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull(),
  accessToken: text('access_token'),
  institutionId: text('institution_id'),
  institutionName: text('institution_name'),
  status: text('status').notNull().default('pending'),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  syncCursor: text('sync_cursor'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
