import { pgTable, uuid, text, timestamp, numeric, date, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  billingCycle: text('billing_cycle').notNull(),
  category: text('category').notNull().default('other'),
  status: text('status').notNull().default('active'),
  nextBillingDate: date('next_billing_date'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  isManual: boolean('is_manual').default(false).notNull(),
  confirmedByUser: boolean('confirmed_by_user').default(false).notNull(),
  merchantLogoUrl: text('merchant_logo_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_subscriptions_user_status').on(table.userId, table.status),
]);
