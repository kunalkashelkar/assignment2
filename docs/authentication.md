# Authentication Architecture Documentation (Better Auth & Prisma)

## Overview
Authentication is implemented via **Better Auth** (`better-auth`) integrated with **Prisma ORM** on PostgreSQL.

## Architecture
- **Adapter**: `prismaAdapter(prisma, { provider: "postgresql" })`
- **Route Handler**: `app/api/auth/[...all]/route.ts` using `toNextJsHandler(auth)`
- **Server Utility**: `lib/auth.ts` providing `auth` configuration and `getSession(headers)`
- **Client Client**: `lib/auth-client.ts` exporting `signIn`, `signUp`, `signOut`, `useSession`
- **Input Validation**: Zod schemas defined in `lib/validations/auth.ts`
- **Password Security**: Passwords are never stored in plain text; Better Auth securely hashes passwords with salted scrypt/argon algorithms.
- **Secret Protection**: `BETTER_AUTH_SECRET` is read exclusively on the server runtime and never exposed to client bundles.

## Authentication Endpoints & Pages
- Registration: `/register` (`app/register/page.tsx` + `components/RegisterForm.tsx`)
- Login: `/login` (`app/login/page.tsx` + `components/LoginForm.tsx`)
- API Route: `/api/auth/*` handling sign-in, sign-up, session refresh, and sign-out.

## Server-Side Session Retrieval
To authenticate a server request in route handlers or server actions:
```typescript
import { getSession } from "@/lib/auth";

const session = await getSession(request.headers);
if (!session) {
  // Return 401 Unauthorized
}
```
