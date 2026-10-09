# Security Audit & Vulnerability Assessment

## Threat Modeling & Mitigation Summary

### 1. Multi-Tenant Cross-Contamination
- **Threat**: User A accessing or modifying transactions belonging to Organization B.
- **Mitigation**: Every transaction query and mutation is strictly filtered by `organizationId`. The `organizationId` is never trusted from client-provided JSON or URL parameters; it is extracted server-side from the authenticated session's verified `membership` record in PostgreSQL.

### 2. Privilege Escalation & Role Tampering
- **Threat**: Client submitting an `isAdmin: true` flag or `role: "ADMIN"` in request headers or body.
- **Mitigation**: Client-supplied role flags are disregarded. The system resolves roles server-side by joining `memberships` with `roles` against the active session ID.

### 3. Credential & Secret Management
- **Threat**: Accidental leakage of database passwords, session secrets, or provider keys into source control or browser bundles.
- **Mitigation**:
  - `.env` is ignored via `.gitignore`.
  - `.env.example` contains only configuration variable templates and placeholder keys.
  - Better Auth secrets and Resend keys are isolated to server environments. Client components only access `process.env.NEXT_PUBLIC_APP_URL`.

### 4. Injection Vulnerabilities
- **Threat**: SQL injection through malformed inputs or NoSQL query injection in MongoDB.
- **Mitigation**:
  - Prisma utilizes parameterized SQL queries by default.
  - All incoming request payloads and query parameters are validated against strict Zod schemas before hitting ORM/ODM layers.
  - Mongoose models enforce schema typing on all document structures.

### 5. Webhook Spoofing & Replay Attacks
- **Threat**: Malicious actor submitting forged email delivery events to alter audit states.
- **Mitigation**:
  - Inbound webhook payloads to `/api/webhooks/resend` are cryptographically verified using `svix` HMAC signatures with timestamp drift detection.
  - Webhook processing is idempotent: unique `providerEventId` constraints prevent duplicate inserts from network retries.

### 6. Error & Information Leakage
- **Threat**: Stack traces, database connection strings, or system paths returned in HTTP 500 error responses.
- **Mitigation**: Route handlers encapsulate errors within structured JSON envelopes (`{ success: false, error: "..." }`) and log diagnostics server-side without reflecting internal database error traces to the caller.
