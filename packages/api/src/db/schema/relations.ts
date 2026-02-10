import { relations } from 'drizzle-orm';
import { users } from './users';
import { dataConnections } from './data-connections';
import { transactions } from './transactions';
import { subscriptions } from './subscriptions';
import { subscriptionTransactions } from './subscription-transactions';
import { subscriptionPriceHistory } from './subscription-price-history';
import { alerts } from './alerts';

export const usersRelations = relations(users, ({ many }) => ({
  dataConnections: many(dataConnections),
  transactions: many(transactions),
  subscriptions: many(subscriptions),
  alerts: many(alerts),
}));

export const dataConnectionsRelations = relations(dataConnections, ({ one, many }) => ({
  user: one(users, { fields: [dataConnections.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  dataConnection: one(dataConnections, { fields: [transactions.dataConnectionId], references: [dataConnections.id] }),
  subscriptionTransactions: many(subscriptionTransactions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  subscriptionTransactions: many(subscriptionTransactions),
  priceHistory: many(subscriptionPriceHistory),
  alerts: many(alerts),
}));

export const subscriptionTransactionsRelations = relations(subscriptionTransactions, ({ one }) => ({
  subscription: one(subscriptions, { fields: [subscriptionTransactions.subscriptionId], references: [subscriptions.id] }),
  transaction: one(transactions, { fields: [subscriptionTransactions.transactionId], references: [transactions.id] }),
}));

export const subscriptionPriceHistoryRelations = relations(subscriptionPriceHistory, ({ one }) => ({
  subscription: one(subscriptions, { fields: [subscriptionPriceHistory.subscriptionId], references: [subscriptions.id] }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, { fields: [alerts.userId], references: [users.id] }),
  subscription: one(subscriptions, { fields: [alerts.subscriptionId], references: [subscriptions.id] }),
}));
