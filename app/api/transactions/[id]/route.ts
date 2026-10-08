import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession, AuthorizationError } from "@/lib/authorization";
import { UpdateTransactionSchema } from "@/lib/validations/transaction";
import { RoleType, TransactionStatus, AuditEventType } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession(request.headers);
    const userId = session.user.id;

    const membership = await prisma.membership.findFirst({
      where: { userId },
      include: { role: true },
    });

    if (!membership) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { organization: true, user: { select: { email: true, name: true } } },
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    // Tenant check
    if (transaction.organizationId !== membership.organizationId) {
      return NextResponse.json({ success: false, error: "Forbidden: Cross-tenant access denied" }, { status: 403 });
    }

    // Role check: Admin or owner
    const isAdmin = membership.role.name === RoleType.ADMIN;
    if (!isAdmin && transaction.userId !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden: Access restricted to owner" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession(request.headers);
    const userId = session.user.id;

    const membership = await prisma.membership.findFirst({
      where: { userId },
      include: { role: true },
    });

    if (!membership) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.organizationId !== membership.organizationId) {
      return NextResponse.json({ success: false, error: "Forbidden: Cross-tenant modification denied" }, { status: 403 });
    }

    const isAdmin = membership.role.name === RoleType.ADMIN;
    if (!isAdmin && transaction.userId !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = UpdateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || "Invalid payload" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.transaction.update({
        where: { id },
        data: {
          ...(parsed.data.description ? { description: parsed.data.description } : {}),
          ...(parsed.data.status ? { status: parsed.data.status as TransactionStatus } : {}),
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          eventType: AuditEventType.TRANSACTION_UPDATED,
          action: `Updated transaction ${id}`,
          details: parsed.data,
        },
      });

      return res;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession(request.headers);
    const userId = session.user.id;

    const membership = await prisma.membership.findFirst({
      where: { userId },
      include: { role: true },
    });

    // Only ADMIN may delete transactions
    if (!membership || membership.role.name !== RoleType.ADMIN) {
      return NextResponse.json({ success: false, error: "Forbidden: Deleting requires ADMIN role" }, { status: 403 });
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.organizationId !== membership.organizationId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.transaction.delete({ where: { id } }),
      prisma.auditLog.create({
        data: {
          userId,
          eventType: AuditEventType.TRANSACTION_DELETED,
          action: `Deleted transaction ${id} (Ref: ${transaction.reference})`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: "Failed to delete transaction" }, { status: 500 });
  }
}
