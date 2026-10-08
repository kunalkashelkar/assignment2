import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export class AuthorizationError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

/**
 * Validates session from incoming request headers
 */
export async function requireSession(requestHeaders?: Headers) {
  const h = requestHeaders || (await headers());
  const session = await getSession(h);

  if (!session || !session.user) {
    throw new AuthorizationError("Authentication required", 401);
  }

  return session;
}

/**
 * Validates that the authenticated user possesses an authorized role in the target tenant or globally
 */
export async function requireRole(
  requiredRoles: RoleType[],
  organizationId?: string,
  requestHeaders?: Headers
) {
  const session = await requireSession(requestHeaders);
  const userId = session.user.id;

  // Query database membership directly - NEVER trust role from client headers/body
  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      ...(organizationId ? { organizationId } : {}),
    },
    include: {
      role: true,
      organization: true,
    },
  });

  if (!membership || !membership.role) {
    throw new AuthorizationError("No authorized membership found for this user", 403);
  }

  const roleName = membership.role.name as RoleType;
  if (!requiredRoles.includes(roleName)) {
    throw new AuthorizationError(
      `Forbidden: Required role [${requiredRoles.join(", ")}], but user holds [${roleName}]`,
      403
    );
  }

  return {
    session,
    membership,
    role: roleName,
    organization: membership.organization,
  };
}

/**
 * Validates user membership in a specific organization
 */
export async function requireOrganizationAccess(
  organizationId: string,
  requestHeaders?: Headers
) {
  return await requireRole(
    [RoleType.ADMIN, RoleType.MEMBER, RoleType.GUEST],
    organizationId,
    requestHeaders
  );
}
