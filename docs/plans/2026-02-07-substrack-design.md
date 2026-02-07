# SubsTrack — Subscription Tracking App

## Context

Build a personal subscription tracking app (designed to grow into a SaaS product) that automatically detects and categorizes recurring charges from connected bank accounts. The app helps users understand their total subscription spend, track price changes, and manage renewals — solving the common problem of losing track of subscriptions and overpaying.

## Architecture

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: Hono (TypeScript) API server on Node.js
- **Frontend**: React + Vite (separate from API for future mobile support)
- **Database**: PostgreSQL via Supabase + Drizzle ORM
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Data Source (MVP)**: Plaid (bank account connection + transaction sync)
- **Detection**: Rule-based (known merchant matching + recurrence pattern analysis)
- **Type Safety**: Hono RPC mode for end-to-end typed API calls, Zod for validation

```
substrack/
├── packages/
│   ├── shared/          # Shared types, constants, utils
│   ├── api/             # Hono API server
│   │   └── src/
│   │       ├── routes/
│   │       ├── middleware/
│   │       ├── services/
│   │       ├── connectors/  # Plugin-based data source connectors
│   │       ├── detection/   # Subscription detection engine
│   │       └── db/          # Drizzle schemas + migrations
│   └── web/             # React + Vite frontend
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── hooks/
│           ├── contexts/
│           └── lib/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Data Model

**Core tables**: `users`, `data_connections`, `transactions`, `subscriptions`, `subscription_transactions` (junction), `subscription_price_history`, `alerts`

Key design decisions:
- `normalizedMerchant` column on transactions — pre-computed at insert, indexed, used by detection engine
- `subscription_price_history` tracks amount changes over time
- `subscription_transactions` junction table links a subscription to its many transactions
- `confidence` not stored as a column — derived from detection metadata (isManual, confirmedByUser)

## Implementation Phases

### Phase 1: Project Scaffolding (~1 session)
1. Create `substrack/` directory with root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`
2. Create `packages/shared/` with types, constants (KNOWN_MERCHANTS dict), and utils (`inferBillingCycle`, `normalizeMerchantName`)
3. Create `packages/api/` with Hono + `@hono/node-server`, health endpoint
4. Create `packages/web/` via `pnpm create vite --template react-ts`, add Tailwind CSS v4
5. **Verify**: `pnpm dev` starts both servers; shared package imports work

### Phase 2: Database Schema (~0.5 session)
1. Set up Supabase project, get connection string + keys
2. Create Drizzle config + connection (`postgres` driver with `prepare: false` for Supabase pooler)
3. Define all schema files: `users.ts`, `data-connections.ts`, `transactions.ts`, `subscriptions.ts`, `alerts.ts`, `relations.ts`
4. **Verify**: `pnpm db:generate && pnpm db:migrate` runs cleanly; Drizzle Studio shows tables

### Phase 3: Authentication (~1 session)
1. Configure Supabase Auth (email/password + Google OAuth)
2. Build auth middleware (`packages/api/src/middleware/auth.ts`) — verifies Supabase JWT via `jose`
3. Build user sync service — upserts `users` row on first authenticated API call
4. Build frontend auth: `AuthContext`, `LoginPage`, `SignUpPage`, `AuthCallbackPage`
5. Build Supabase client (`lib/supabase.ts`) and Hono RPC client with auth header injection (`lib/api.ts`)
6. **Verify**: Sign up → dashboard redirect; API calls without token get 401; with token get 200

### Phase 4: Plaid Integration (~1.5 sessions)
1. Define `DataConnector` interface (`packages/api/src/connectors/types.ts`) — `initConnection`, `completeConnection`, `syncTransactions`
2. Implement `PlaidConnector` class — link token creation, public token exchange, cursor-based `transactionsSync`
3. Build transaction sync service (`services/transaction.service.ts`) — processes sync results into DB with upsert/delete
4. Build Plaid webhook handler (`routes/webhooks.ts`) — handles `SYNC_UPDATES_AVAILABLE`
5. Build frontend `PlaidLinkButton` component using `react-plaid-link`
6. **Verify**: Connect Plaid sandbox (`user_good`), transactions appear in DB

### Phase 5: Subscription Detection Engine (~1.5 sessions)
1. Build pure detection function (`detection/engine.ts`):
   - Group transactions by normalized merchant name
   - Sub-group by similar amounts (5% tolerance)
   - Match against KNOWN_MERCHANTS for high-confidence detection
   - Analyze recurrence patterns for unknown merchants (need 3+ occurrences)
   - Return `DetectionCandidate[]` with merchant, amount, billingCycle, confidence, transactionIds
2. Build detection service (`services/detection.service.ts`) — orchestrates detection + DB writes + price change tracking
3. **Verify**: Unit tests with various transaction patterns pass; integration test with Plaid sandbox data detects known subscriptions

### Phase 6: API Routes (~1.5 sessions)
| Route Group | Key Endpoints |
|---|---|
| `connections` | `POST /link-token`, `POST /complete`, `GET /`, `POST /:id/sync`, `DELETE /:id` |
| `subscriptions` | `GET /`, `GET /:id` (with transactions + price history), `POST /`, `PATCH /:id`, `DELETE /:id`, `POST /detect` |
| `transactions` | `GET /` (paginated, filterable) |
| `dashboard` | `GET /summary`, `GET /spend-by-category`, `GET /upcoming-renewals` |
| `alerts` | `GET /`, `PATCH /:id/read`, `POST /read-all` |

All routes use `zValidator` for input validation and return `{ success, data?, error? }` envelope.

**Verify**: All endpoints testable with curl/Hono test client

### Phase 7: Frontend (~3 sessions)
**Pages**: Dashboard, Subscriptions (list), Subscription Detail, Connections, Settings, Login/Signup

**Key components**:
- `AppLayout` (sidebar nav + header + content)
- `SpendSummary` (monthly/yearly totals)
- `SpendByCategory` (Recharts PieChart)
- `UpcomingRenewals` (next 30 days)
- `SubscriptionList` with filter tabs (All/Active/Cancelled)
- `SubscriptionCard` (logo, name, amount, cycle)
- `SubscriptionForm` (create/edit modal)
- `SubscriptionDetail` (linked transactions table + price history chart)
- `PlaidLinkButton` + `ConnectionList`

**Data layer**: React Query hooks (`useSubscriptions`, `useDashboard`, `useConnections`, `useAlerts`) wrapping Hono RPC client.

**Styling**: Tailwind CSS v4 with custom theme colors.

**Verify**: Full user flow — sign up → connect bank → see subscriptions → add manual sub → view details

### Phase 8: Testing (ongoing)
- **Unit**: Vitest for detection engine, shared utils, services (mocked DB)
- **Integration**: Hono test client for API route testing
- **Frontend**: Vitest + React Testing Library for components and hooks
- **CI**: GitHub Actions — install, build, lint, test

## Key Dependencies
- `hono`, `@hono/node-server`, `@hono/zod-validator` — API framework
- `drizzle-orm`, `drizzle-kit`, `postgres` — Database ORM
- `plaid` — Plaid SDK
- `@supabase/supabase-js` — Auth client
- `jose` — JWT verification
- `zod` — Schema validation
- `react`, `react-dom`, `react-router` — Frontend
- `@tanstack/react-query` — Data fetching
- `react-plaid-link` — Plaid Link widget
- `recharts` — Charts
- `tailwindcss`, `@tailwindcss/vite` — Styling
- `turbo`, `tsx`, `vitest` — Tooling

## Verification Plan
1. `pnpm dev` starts API (port 3001) + web (port 5173)
2. Health check: `GET /health` returns `{ status: "ok" }`
3. Auth flow: sign up → redirects to dashboard → API calls succeed with token
4. Plaid flow: connect sandbox bank → transactions appear in DB
5. Detection: `POST /api/subscriptions/detect` → subscriptions created from transaction patterns
6. Dashboard: monthly/yearly spend, category breakdown, upcoming renewals all render
7. CRUD: create/edit/delete manual subscription works
8. Price history: when detection finds changed amounts, history record is created
9. `pnpm test` passes all unit + integration tests
