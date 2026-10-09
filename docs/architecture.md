# Assignment 2 System Architecture

## Overview
This platform delivers a secure full-stack cloud and transactional architecture adhering to core course outcomes:
- **CO3**: Secure authorization, role-based access control, and multi-tenant session validation via Better Auth and Next.js Edge Middleware.
- **CO4**: Data-driven full-stack endpoints connecting relational storage via Prisma ORM (PostgreSQL) and flexible document persistence via Mongoose (MongoDB).

---

## Architectural Topology
```
                     CLIENT BROWSER / API CONSUMER
                                   │
                                   ▼
                       NEXT.JS EDGE MIDDLEWARE
                     (Session Cookie Interception)
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
      PROTECTED ROUTES                          PUBLIC ROUTES
  (/dashboard, /admin, /api/*)           (/login, /register, /api/health)
              │
              ▼
    SESSION & ROLE VALIDATION
  (requireSession, requireRole)
              │
     ┌────────┴────────┬─────────────────────┐
     ▼                 ▼                     ▼
PRISMA ORM         MONGOOSE / MONGODB   RESEND EMAIL DISPATCH
(PostgreSQL)      (Analytics Documents) (React Email Templates)
     │                                       │
     ▼                                       ▼
RELATIONAL LEDGER                     RESEND WEBHOOK
(Transactions, AuditLogs)             (/api/webhooks/resend)
```

---

## Component Boundaries

### 1. Presentation & Routing Layer (App Router)
- `app/`: Next.js 15 App Router providing SSR, Server Components, and streaming.
- `components/`: Modular React components (`LoginForm.tsx`, `RegisterForm.tsx`, `DatabaseMetricsView.tsx`).
- `middleware.ts`: Guard ensuring unauthenticated requests never hit protected page layouts or private route handlers.

### 2. Identity & Access Management (Better Auth)
- `lib/auth.ts`: Better Auth instance mounted with Prisma PostgreSQL adapter.
- `lib/authorization.ts`: Server-side policy enforcement (`requireSession`, `requireRole`, `requireOrganizationAccess`).
- Role permissions:
  - **ADMIN**: Access to `/admin`, organization-wide transaction audit stream, transaction deletion.
  - **MEMBER**: Access to `/dashboard`, scoped tenant transaction operations.
  - **GUEST**: Restricted view-only capabilities; denied transaction mutations.

### 3. Relational Ledger & Multi-Tenancy (Prisma ORM + PostgreSQL)
- Normalized relational graph:
  - `Organization` (Tenant)
  - `User`
  - `Role` (`ADMIN`, `MEMBER`, `GUEST`)
  - `Membership` (Junction table linking User, Tenant, and Role)
  - `Transaction` (Scoped to Tenant and User)
  - `AuditLog` (Immutable security audit stream)
  - `EmailEvent` (Transactional email state tracking)

### 4. Document & Analytics Store (Mongoose + MongoDB)
- `lib/mongodb.ts`: Global cached singleton connection for serverless/edge resilience.
- `lib/models/AnalyticsEvent.ts`: Flexible document schema for high-throughput time-series event metrics.
- `app/api/analytics/verify/route.ts`: Endpoint verifying MongoDB read/write capabilities.

### 5. Transactional Event Notifications & Webhooks
- `lib/email.ts`: Transactional email dispatcher with dev simulator fallback.
- `emails/`: Professional templates rendered with `@react-email/components`.
- `app/api/webhooks/resend/route.ts`: Idempotent cryptographic webhook endpoint verifying Svix signatures.
