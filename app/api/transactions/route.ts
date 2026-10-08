import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession, requireRole, AuthorizationError } from "@/lib/authorization";
import { CreateTransactionSchema } from "@/lib/validations/transaction";
import { RoleType, TransactionStatus, AuditEventType } from "@prisma/client";
import { sendTransactionNotification } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request.headers);
    const userId = session.user.id;

    // Check user membership and role
    const membership = await prisma.membership.findFirst({
      where: { userId },
      include: { role: true },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "No organization membership found" },
        { status: 403 }
      );
    }

    const isAdmin = membership.role.name === RoleType.ADMIN;

    // ADMIN sees all tenant transactions, MEMBER sees their own
    const transactions = await prisma.transaction.findMany({
      where: isAdmin
        ? { organizationId: membership.organizationId }
        : { organizationId: membership.organizationId, userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, membership, role } = await requireRole(
      [RoleType.ADMIN, RoleType.MEMBER],
      undefined,
      request.headers
    );

    if (role === RoleType.GUEST) {
      return NextResponse.json(
        { success: false, error: "Guests are not authorized to create transactions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = CreateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    // Tenant and User IDs derived STRICTLY from server session/membership
    const orgId = membership.organizationId;
    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name || "Customer";
    const reference = `TX-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Step 1: Execute database mutation atomically
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          organizationId: orgId,
          userId,
          amount: parsed.data.amount,
          currency: parsed.data.currency || "USD",
          description: parsed.data.description,
          reference,
          status: TransactionStatus.COMPLETED,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          eventType: AuditEventType.TRANSACTION_CREATED,
          action: `Created transaction ${reference} for amount $${parsed.data.amount}`,
          details: {
            amount: parsed.data.amount,
            reference,
            organizationId: orgId,
          },
        },
      }),
    ]);

    // Step 2: Trigger transactional email notification workflow
    // If DB transaction failed above, execution never reaches here.
    try {
      await sendTransactionNotification({
        to: userEmail,
        userName,
        reference: transaction.reference,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        organizationName: membership.organization.name,
        userId,
      });
    } catch (emailErr) {
      // Non-blocking log so transaction is not undone after being committed
      console.warn("Transactional email dispatch encountered a non-fatal warning:", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        data: transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    console.error("POST transaction error:", error);
    return NextResponse.json({ success: false, error: "Failed to process transaction" }, { status: 500 });
  }
}
