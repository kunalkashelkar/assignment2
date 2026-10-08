# Database Seeding Workflow Documentation

## Overview
The Assignment 2 relational seeding pipeline generates realistic relational datasets while strictly preserving foreign-key integrity across PostgreSQL tables.

## Conceptual Data Graph
```
           Organization (Tenant)
                │ (1:N)
                ▼
            Membership ◀────── Role (ADMIN, MEMBER, GUEST)
                ▲ (N:1)
                │
              User
         ┌──────┴──────┐
         ▼             ▼
    Transaction    AuditLog & EmailEvent
```

## Seeding Pipeline Details
The seed script is located at `prisma/seed.ts` and uses `@faker-js/faker`:

1. **Deterministic Seeds**: Configured with `faker.seed(20261008)` to generate consistent, reproducible test environments.
2. **Fixed Developer Accounts**:
   - `admin@assignment2.local` with role `ADMIN`
   - `member@assignment2.local` with role `MEMBER`
   - `guest@assignment2.local` with role `GUEST`
3. **Foreign-Key Preservation**:
   - Organizations and system Roles are seeded first.
   - Memberships join generated Users to existing Organizations and existing Roles.
   - Transactions are scoped to an existing User and an existing Organization.
   - Audit logs and Email events reference existing Users or maintain clean nullable references.
4. **Environment Variables Customization**:
   - `SEED_ORGS`: Number of organizations to generate (default: 4)
   - `SEED_USERS`: Number of users to generate (default: 15)
   - `SEED_TRANSACTIONS`: Number of transactions to generate (default: 30)
   - `SEED_AUDIT_LOGS`: Number of audit events (default: 25)
   - `SEED_EMAIL_EVENTS`: Number of email events (default: 20)

## Commands

### Execute Seed Only
```bash
npm run prisma:seed
```

### Full Database Reset & Reseed
```bash
npm run db:reset
```
This drops the database, reapplies all Prisma migrations from scratch, and executes `prisma/seed.ts`.
