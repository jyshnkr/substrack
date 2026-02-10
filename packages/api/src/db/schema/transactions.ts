import { pgTable, uuid, text, timestamp, numeric, date, boolean, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { dataConnections } from './data-connections';

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  dataConnectionId: uuid('data_connection_id').notNull().references(() => dataConnections.id),
  externalId: text('external_id').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  date: date('date').notNull(),
  merchantName: text('merchant_name'),
  normalizedMerchant: text('normalized_merchant'),
  category: text('category'),
  pending: boolean('pending').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('uq_transactions_connection_external').on(table.dataConnectionId, table.externalId),
  index('idx_transactions_user_merchant').on(table.userId, table.normalizedMerchant),
  index('idx_transactions_user_date').on(table.userId, table.date),
]);
