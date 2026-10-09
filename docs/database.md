# Normalized Relational Database Specification (PostgreSQL + Prisma)

## Normalized ER Diagram
```
┌─────────────────┐       1:N       ┌─────────────────┐       N:1       ┌─────────────────┐
│  organizations  │ ─────────────── │   memberships   │ ─────────────── │      users      │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
         │                                   │                                   │
         │ 1:N                               │ N:1                               │ 1:N
         ▼                                   ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐                 ┌─────────────────┐
│  transactions   │                 │      roles      │                 │   audit_logs    │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
                                                                                 │
                                                                                 │ 1:N
                                                                                 ▼
                                                                        ┌─────────────────┐
                                                                        │  email_events   │
                                                                        └─────────────────┘
```

## Relational Entity Breakdown

### 1. `users`
- Primary key: `id` (UUIDv4)
- Fields: `name`, `email` (Unique), `emailVerified`, `image`, `createdAt`, `updatedAt`
- Relations:
  - `memberships`: Connects user to multi-tenant organizations
  - `transactions`: Scoped records authored by user
  - `auditLogs`: Security actions initiated by user
  - `emailEvents`: Notifications addressed to user

### 2. `organizations` (Tenants)
- Primary key: `id` (UUIDv4)
- Fields: `name`, `slug` (Unique), `description`, `createdAt`, `updatedAt`
- Enforces strict multi-tenant boundaries across transactions and memberships.

### 3. `roles`
- Primary key: `id` (UUIDv4)
- Fields: `name` (`RoleType` Enum: `ADMIN`, `MEMBER`, `GUEST`), `description`
- Normalized lookup table eliminating string duplication.

### 4. `memberships`
- Primary key: `id` (UUIDv4)
- Foreign Keys: `userId`, `organizationId`, `roleId`
- Constraint: `@@unique([userId, organizationId])` prevents duplicate memberships within the same tenant.
- Cascades: `onDelete: Cascade` for user/org cleanup, `onDelete: Restrict` for roles to protect authorization metadata.

### 5. `transactions`
- Primary key: `id` (UUIDv4)
- Foreign Keys: `organizationId` (Cascade), `userId` (Restrict)
- Fields: `amount` (Decimal 12,2), `currency`, `status` (`TransactionStatus` Enum: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`), `reference` (Unique), `metadata` (Json)
- Indexes: `[organizationId]`, `[userId]`, `[status]`, `[createdAt]` for high-performance tenant reporting.

### 6. `audit_logs`
- Primary key: `id` (UUIDv4)
- Foreign Key: `userId` (Nullable, `SetNull` on delete to preserve immutable audit history)
- Fields: `eventType` (`AuditEventType` Enum), `action`, `details` (Json), `ipAddress`, `userAgent`, `createdAt`
- Indexed on `[userId]`, `[eventType]`, `[createdAt]`.

### 7. `email_events`
- Primary key: `id` (UUIDv4)
- Fields: `emailId` (Resend message ID), `providerEventId` (Unique for idempotent webhook ingestion), `eventType` (`EmailEventType` Enum), `recipient`, `subject`, `metadata` (Json), `createdAt`
- Indexed on `[providerEventId]`, `[emailId]`, `[eventType]`.
