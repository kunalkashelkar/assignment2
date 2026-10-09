# Role-Based Authorization & Multi-Tenant Session Flow

## Authorization Overview
Authorization is enforced defensively at two distinct architectural levels:
1. **Perimeter Layer**: Next.js Edge Middleware intercepts inbound traffic to prevent unauthenticated access.
2. **Server Execution Layer**: Route Handlers and Server Actions validate authenticated user identity and database role memberships before performing any operations.

---

## Defense-in-Depth Pipeline
```
[1] Incoming Client Request
        │
        ▼
[2] Next.js Edge Middleware (middleware.ts)
    ├── Checks session cookie: `better-auth.session_token`
    ├── Public routes bypass: /login, /register, /api/auth, /api/health, /api/webhooks/resend
    └── Unauthenticated:
         ├── Browser Page: 307 Redirect to /login
         └── API Route: 401 Unauthorized Response
        │ (Cookie Present)
        ▼
[3] Route Handler / Server Action Execution
        │
        ▼
[4] Server Session Verification (requireSession)
    └── Validates cryptographically signed session via Better Auth (`auth.api.getSession`)
        │
        ▼
[5] Database Role & Tenant Membership Verification (requireRole)
    ├── Never trusts client role, user ID, or tenant ID from headers/body
    └── Queries `memberships` table for target tenant and role
        │
        ├── ADMIN: Granted access to administrative dashboards and tenant-wide queries
        ├── MEMBER: Granted access to scoped tenant mutations
        └── GUEST: Restricted access; denied write and administrative operations
        │
        ▼
[6] Atomic Prisma Mutation & Immutable Audit Logging
```

---

## Reusable Helper API (`lib/authorization.ts`)

### `requireSession(headers?: Headers)`
Extracts and validates session headers. Throws `AuthorizationError(401)` if absent or expired.

### `requireRole(requiredRoles: RoleType[], organizationId?: string, headers?: Headers)`
Retrieves role permissions directly from the PostgreSQL membership relation. Throws `AuthorizationError(403)` on mismatch.

### `requireOrganizationAccess(organizationId: string, headers?: Headers)`
Ensures the authenticated user is an active member of the target tenant before proceeding.
