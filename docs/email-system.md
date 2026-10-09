# Transactional Email Notification & Webhook Tracking Architecture

## System Overview
The notification subsystem automates transactional notifications following database events, integrating **React Email**, **Resend**, and an idempotent webhook callback processor.

---

## Transactional Lifecycle Workflow
```
[1] Successful Database Mutation (Prisma $transaction)
    ├── Transaction ledger entry created
    └── AuditLog created
        │ (Transaction Committed)
        ▼
[2] Notification Dispatch Trigger (`sendTransactionNotification`)
    ├── Extracts recipient from verified session
    ├── Renders React Email template (`emails/TransactionCreatedEmail.tsx`)
    └── Dispatches via Resend API
        │
        ├── Development Mode (No API Key): Simulated dispatcher records synthetic event
        └── Production Mode: Dispatches over Resend HTTPS API
        │
        ▼
[3] Initial Event Recorded in PostgreSQL (`EmailEvent`)
    └── Status: `SENT` or `QUEUED` with Resend `emailId`
        │
        ▼
[4] Resend Delivery Lifecycle Webhook Callback (`/api/webhooks/resend`)
    ├── Cryptographic signature verified using Svix (`svix-signature`, `svix-timestamp`)
    ├── Zod payload validation (`ResendWebhookPayloadSchema`)
    ├── Idempotency verification: Queries `EmailEvent` for `providerEventId`
    │    └── Duplicate: Returns 200 OK without creating duplicate rows
    └── Mutation: Updates or appends new lifecycle stage (`DELIVERED`, `BOUNCED`, `OPENED`, `CLICKED`)
```

---

## Fault Tolerance & Guarantees
- **Atomic Precondition**: Emails are only dispatched *after* the database transaction commits successfully.
- **Ledger Non-Rollback**: External email timeouts or gateway errors do not corrupt the committed financial transaction. Failed email deliveries are persisted as `FAILED` in `EmailEvent` for diagnostic reporting.
- **Idempotent Ingestion**: Network retries from Resend do not produce duplicate event records.
