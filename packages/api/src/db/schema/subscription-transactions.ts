import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { subscriptions } from './subscriptions';
import { transactions } from './transactions';

export const subscriptionTransactions = pgTable('subscription_transactions', {
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.subscriptionId, table.transactionId] }),
]);
