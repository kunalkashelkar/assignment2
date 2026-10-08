# Resend Webhook Email Lifecycle Tracking Documentation

## Overview
The Resend webhook route at `app/api/webhooks/resend/route.ts` tracks transactional email delivery states (delivered, bounced, opened, clicked, failed) and ingests them into the normalized `EmailEvent` PostgreSQL table.

## Processing Pipeline
```
Resend Email Infrastructure
        ↓ HTTP POST Webhook
Next.js Route Handler (/api/webhooks/resend)
        ↓
Cryptographic Signature Verification (Svix / svix-signature)
        ↓
Payload Validation (Zod ResendWebhookPayloadSchema)
        ↓
Idempotency Verification (Unique providerEventId check)
        ↓
Prisma ORM Mutation
        ↓
Normalized EmailEvent Table
        ↓
HTTP 200 OK Response
```

## Supported Lifecycle Events
- `email.delivered` ➔ `EmailEventType.DELIVERED`
- `email.bounced` ➔ `EmailEventType.BOUNCED`
- `email.complained` / `email.failed` ➔ `EmailEventType.FAILED`
- `email.opened` ➔ `EmailEventType.OPENED`
- `email.clicked` ➔ `EmailEventType.CLICKED`
- `email.sent` ➔ `EmailEventType.SENT`

## Idempotency Guarantee
The table schema enforces `@unique` on `providerEventId`. The webhook verifies if an event with `providerEventId` already exists before writing. If a duplicate delivery occurs, the system safely responds with `HTTP 200 OK` acknowledging the duplicate without corrupting data or generating duplicate entries.

## Testing & Verification Procedure
You can simulate a webhook payload locally using `curl`:
```bash
curl -X POST http://localhost:3000/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.delivered",
    "data": {
      "id": "evt_test_123456",
      "email_id": "msg_test_654321",
      "to": ["admin@assignment2.local"],
      "subject": "Receipt: Transaction Confirmed"
    }
  }'
```
Re-sending the same payload verifies that the second response returns:
`"Event already recorded (idempotent duplicate acknowledged)"`
