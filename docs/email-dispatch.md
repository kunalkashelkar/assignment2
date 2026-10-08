# Transactional Email Dispatch Architecture

## Overview
Assignment 2 integrates **React Email** components and **Resend** for automated event notifications following successful database ledger mutations.

## Transactional Workflow
```
Client Request (Route Handler or Server Action)
        ↓
Validation (Zod) & Session Verification
        ↓
Atomic Database Mutation (Prisma $transaction)
   - Transaction created
   - AuditLog recorded
        ↓
Determine Recipient & Metadata
        ↓
Render React Email Template
        ↓
Send through Resend (or Local Development Simulator)
        ↓
Record Initial EmailEvent in PostgreSQL
        ↓
Return Mutation Response to Client
```

## Resilience & Guarantees
1. **Never False Positive**: The email dispatch is executed *only after* the Prisma `$transaction` successfully commits. If the database mutation fails or is aborted, no email is dispatched.
2. **Non-Blocking Post-Commit Handling**: If Resend experiences external gateway timeouts or rate limits, the mutation status remains committed, and an `EmailEvent` is recorded with `FAILED` status, logging the incident without corrupting ledger state.
3. **Execution Model**:
   - In Next.js server runtime, email rendering and dispatch are asynchronous `Promise`-based actions.
   - For local development without a `RESEND_API_KEY`, a simulated dispatcher records events directly to the database with a synthetic message ID, allowing 100% offline testing.
