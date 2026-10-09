# Assignment 2: Automated Relational Data Seeding, Transactional Event Notification & Secure Full-Stack Endpoints

## Executive Summary
This project implements a secure full-stack backend architecture fulfilling all requirements for Assignment 2:
- **CO3**: Secure authorization, role-based access control, and multi-tenant session validation via Better Auth and Next.js Edge Middleware.
- **CO4**: Data-driven full-stack endpoints connecting relational storage via Prisma ORM (PostgreSQL) and object databases via Mongoose (MongoDB).

---

## Assignment Requirement Matrix

| Assignment Requirement | Implemented | File | Evidence / Verification |
| :--- | :---: | :--- | :--- |
| **Normalized Relational Model** | Yes | [`prisma/schema.prisma`](file:///c:/College%20Work/assignment2/prisma/schema.prisma) | Schema with Users, Organizations, Roles, Memberships, Transactions, AuditLogs, EmailEvents |
| **Prisma Migrations** | Yes | [`prisma/migrations/20261008080007_init_assignment2/migration.sql`](file:///c:/College%20Work/assignment2/prisma/migrations/20261008080007_init_assignment2/migration.sql) | Clean PostgreSQL schema migration executed and applied |
| **Reusable Prisma Client** | Yes | [`lib/prisma.ts`](file:///c:/College%20Work/assignment2/lib/prisma.ts) | Global singleton client preventing connection pool exhaustion |
| **Mongoose & MongoDB Integration** | Yes | [`lib/mongodb.ts`](file:///c:/College%20Work/assignment2/lib/mongodb.ts), [`lib/models/AnalyticsEvent.ts`](file:///c:/College%20Work/assignment2/lib/models/AnalyticsEvent.ts) | Cached MongoDB connection utility with Mongoose model and verification route |
| **Faker.js Relational Seeding** | Yes | [`prisma/seed.ts`](file:///c:/College%20Work/assignment2/prisma/seed.ts) | Deterministic (`faker.seed(20261008)`), idempotent seeding maintaining strict foreign-key integrity |
| **Automated Reset & Reseed** | Yes | [`package.json`](file:///c:/College%20Work/assignment2/package.json) | `npm run db:reset` executes `prisma migrate reset --force` and runs seed automatically |
| **Live Database Verification** | Yes | [`lib/database-summary.ts`](file:///c:/College%20Work/assignment2/lib/database-summary.ts), [`app/api/admin/database-summary/route.ts`](file:///c:/College%20Work/assignment2/app/api/admin/database-summary/route.ts) | Real-time counts, financial volume aggregations, and live queries without hardcoded values |
| **Better Auth Session Layer** | Yes | [`lib/auth.ts`](file:///c:/College%20Work/assignment2/lib/auth.ts), [`app/api/auth/[...all]/route.ts`](file:///c:/College%20Work/assignment2/app/api/auth/%5B...all%5D/route.ts) | Better Auth with PostgreSQL adapter, session hashing, and credential validation |
| **Auth UI & Zod Validation** | Yes | [`components/LoginForm.tsx`](file:///c:/College%20Work/assignment2/components/LoginForm.tsx), [`components/RegisterForm.tsx`](file:///c:/College%20Work/assignment2/components/RegisterForm.tsx), [`lib/validations/auth.ts`](file:///c:/College%20Work/assignment2/lib/validations/auth.ts) | Form validation and registration/login interface |
| **Edge Middleware Protection** | Yes | [`middleware.ts`](file:///c:/College%20Work/assignment2/middleware.ts) | Intercepts protected page and API routes; redirects unauthenticated browsers to `/login` |
| **Role-Based Authorization** | Yes | [`lib/authorization.ts`](file:///c:/College%20Work/assignment2/lib/authorization.ts), [`app/admin/page.tsx`](file:///c:/College%20Work/assignment2/app/admin/page.tsx) | Server-side role resolution (`ADMIN`, `MEMBER`, `GUEST`) with tenant membership checks |
| **Multi-Tenant Transaction Endpoints**| Yes | [`app/api/transactions/route.ts`](file:///c:/College%20Work/assignment2/app/api/transactions/route.ts), [`app/api/transactions/[id]/route.ts`](file:///c:/College%20Work/assignment2/app/api/transactions/%5Bid%5D/route.ts) | Tenant-isolated GET, POST, PATCH, DELETE operations strictly deriving IDs from server session |
| **Server Actions** | Yes | [`actions/transactions.ts`](file:///c:/College%20Work/assignment2/actions/transactions.ts) | Server action performing atomic transaction creation, audit logging, and email notification |
| **Transactional Email Notifications** | Yes | [`lib/email.ts`](file:///c:/College%20Work/assignment2/lib/email.ts), [`emails/TransactionCreatedEmail.tsx`](file:///c:/College%20Work/assignment2/emails/TransactionCreatedEmail.tsx) | Post-commit transactional email dispatch with React Email and Resend |
| **Resend Webhook Tracking** | Yes | [`app/api/webhooks/resend/route.ts`](file:///c:/College%20Work/assignment2/app/api/webhooks/resend/route.ts) | Cryptographic Svix signature validation, payload parsing, and idempotent `EmailEvent` tracking |
| **Health Check Endpoint** | Yes | [`app/api/health/route.ts`](file:///c:/College%20Work/assignment2/app/api/health/route.ts) | Confirms service availability and uptime |

---

## Tech Stack
- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (Strict Mode enabled)
- **Styling**: Tailwind CSS
- **Relational ORM**: Prisma ORM with PostgreSQL
- **Document Store**: Mongoose with MongoDB
- **Authentication**: Better Auth with PostgreSQL adapter
- **Validation**: Zod
- **Email Delivery**: Resend & React Email
- **Webhook Verification**: Svix
- **Mock Data Generation**: @faker-js/faker
- **Code Quality**: ESLint

---

## Local Setup & Installation

### 1. Prerequisites
- Node.js >= 18
- PostgreSQL running locally on port `5432`
- MongoDB running locally on port `27017`

### 2. Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```
Ensure your database credentials in `.env` match your local PostgreSQL and MongoDB instances.

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Reseed
Generate the Prisma client, apply migrations, and execute the automated seeding pipeline:
```bash
npx prisma generate
npm run db:reset
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Testing & Verification Commands

| Command | Description |
| :--- | :--- |
| `npm run lint` | Runs Next.js ESLint verification |
| `npm run build` | Compiles production bundle and validates type correctness |
| `npm run prisma:seed` | Runs deterministic faker seeding script |
| `npm run db:reset` | Resets PostgreSQL, reapplies migrations, and reseeds database |
| `curl http://localhost:3000/api/health` | Tests service health endpoint |
| `curl http://localhost:3000/api/admin/database-summary` | Inspects live PostgreSQL metrics |
| `curl http://localhost:3000/api/analytics/verify` | Tests MongoDB & Mongoose connectivity |

---

## Documentation Index
- [Architecture Overview](docs/architecture.md)
- [Database Specification & ERD](docs/database.md)
- [Database Seeding Workflow](docs/database-seeding.md)
- [Authentication Architecture](docs/authentication.md)
- [Authorization & Defense-in-Depth](docs/authorization.md)
- [Email Dispatch System](docs/email-system.md)
- [Resend Webhook Specification](docs/resend-webhook.md)
- [Security Audit & Vulnerability Assessment](docs/security-audit.md)
