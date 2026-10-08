import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that never require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth",
  "/api/health",
  "/api/webhooks/resend",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public routes without session check
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (isPublic) {
    return NextResponse.next();
  }

  // 2. Check for Better Auth session cookies
  // Better Auth stores standard cookie session tokens
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const isApi = pathname.startsWith("/api/");
  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin");

  if (!sessionCookie && (isProtectedPage || (isApi && !isPublic))) {
    if (isApi) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Authentication required",
        },
        { status: 401 }
      );
    }

    // Redirect unauthenticated browser requests to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/transactions/:path*",
    "/api/admin/:path*",
  ],
};
