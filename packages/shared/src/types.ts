import { z } from "zod";

// ─── Enums ───────────────────────────────────────────────

export const BillingCycle = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  SEMI_ANNUAL: "semi_annual",
  ANNUAL: "annual",
  UNKNOWN: "unknown",
} as const;

export type BillingCycle = (typeof BillingCycle)[keyof typeof BillingCycle];

export const SubscriptionStatus = {
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  TRIAL: "trial",
} as const;

export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const SubscriptionCategory = {
  STREAMING: "streaming",
  MUSIC: "music",
  SOFTWARE: "software",
  GAMING: "gaming",
  NEWS: "news",
  FITNESS: "fitness",
  FOOD: "food",
  SHOPPING: "shopping",
  PRODUCTIVITY: "productivity",
  FINANCE: "finance",
  EDUCATION: "education",
  CLOUD: "cloud",
  SECURITY: "security",
  OTHER: "other",
} as const;

export type SubscriptionCategory =
  (typeof SubscriptionCategory)[keyof typeof SubscriptionCategory];

export const ConnectionStatus = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error",
  PENDING: "pending",
} as const;

export type ConnectionStatus =
  (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

export const AlertType = {
  PRICE_INCREASE: "price_increase",
  PRICE_DECREASE: "price_decrease",
  NEW_SUBSCRIPTION: "new_subscription",
  UPCOMING_RENEWAL: "upcoming_renewal",
  PAYMENT_FAILED: "payment_failed",
} as const;

export type AlertType = (typeof AlertType)[keyof typeof AlertType];

// ─── Domain Interfaces ──────────────────────────────────

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  normalizedName: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  nextBillingDate: string | null;
  startDate: string | null;
  endDate: string | null;
  isManual: boolean;
  confirmedByUser: boolean;
  merchantLogoUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  dataConnectionId: string;
  externalId: string;
  amount: number;
  currency: string;
  date: string;
  merchantName: string | null;
  normalizedMerchant: string | null;
  category: string | null;
  pending: boolean;
  createdAt: string;
}

export interface DataConnection {
  id: string;
  userId: string;
  provider: string;
  institutionId: string | null;
  institutionName: string | null;
  status: ConnectionStatus;
  lastSyncAt: string | null;
  syncCursor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPriceHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  detectedAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  subscriptionId: string | null;
  type: AlertType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── Detection Types ────────────────────────────────────

export interface DetectionCandidate {
  merchantName: string;
  normalizedName: string;
  amount: number;
  billingCycle: BillingCycle;
  confidence: number;
  category: SubscriptionCategory;
  transactionIds: string[];
  firstSeen: string;
  lastSeen: string;
}

// ─── API Types ──────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardSummary {
  monthlyTotal: number;
  yearlyTotal: number;
  activeCount: number;
  currency: string;
}

export interface SpendByCategory {
  category: SubscriptionCategory;
  amount: number;
  count: number;
}

export interface UpcomingRenewal {
  subscriptionId: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  daysUntilRenewal: number;
}

// ─── Zod Schemas (for validation) ───────────────────────

export const billingCycleSchema = z.enum([
  "weekly",
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
  "unknown",
]);

export const subscriptionStatusSchema = z.enum([
  "active",
  "paused",
  "cancelled",
  "trial",
]);

export const subscriptionCategorySchema = z.enum([
  "streaming",
  "music",
  "software",
  "gaming",
  "news",
  "fitness",
  "food",
  "shopping",
  "productivity",
  "finance",
  "education",
  "cloud",
  "security",
  "other",
]);

export const createSubscriptionSchema = z.object({
  name: z.string().min(1).max(200),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  billingCycle: billingCycleSchema,
  category: subscriptionCategorySchema,
  status: subscriptionStatusSchema.default("active"),
  nextBillingDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();
