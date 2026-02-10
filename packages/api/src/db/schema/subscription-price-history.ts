import { pgTable, uuid, numeric, timestamp } from 'drizzle-orm/pg-core';
import { subscriptions } from './subscriptions';

export const subscriptionPriceHistory = pgTable('subscription_price_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  detectedAt: timestamp('detected_at', { withTimezone: true }).defaultNow().notNull(),
});
