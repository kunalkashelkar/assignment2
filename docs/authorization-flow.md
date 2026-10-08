# Role-Based Authorization & Proxy Flow Documentation

## Overview
The authorization architecture implements defence-in-depth across the application boundary, combining Next.js Middleware edge checks with strict server-side Route Handler and Server Action verification.

## Complete Request Flow
```
Browser
  ↓
Next.js Proxy / Middleware (middleware.ts)
  ↓ [Verifies Session Cookie Presence]
Session Validation (Better Auth / getSession)
  ↓
Authentication Check (requireSession)
  ↓
Role Check (requireRole - ADMIN / MEMBER / GUEST)
  ↓
Route Handler / Server Action
  ↓
Server-Side Authorization & Tenant Context
  ↓
Database (Prisma / PostgreSQL)
```

## Role Hierarchy & Policy
1. **ADMIN**:
   - Access to `/admin` dashboard and privileged audit logs.
   - Access to organization-wide transactions and administrative analytics endpoints.
2. **MEMBER**:
   - Access to `/dashboard`.
   - Access to create and inspect transactions scoped to their specific organization.
3. **GUEST**:
   - Restricted access; read-only limits and denied administrative or sensitive mutation operations.

## Security Guarantees
- **Never trust client-supplied roles**: Roles are resolved directly from database memberships linked to the verified session token.
- **Never trust client-supplied tenant/user IDs**: Mutations derive tenant ID and user ID directly from the authenticated session context.
- **Defence-in-depth**: If middleware is bypassed or directly targeted via raw HTTP curl requests, Route Handlers and Server Actions re-execute `requireSession()` and `requireRole()`.
