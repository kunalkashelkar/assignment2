"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";
import { CreateTransactionSchema, CreateTransactionInput } from "@/lib/validations/transaction";
import { RoleType, TransactionStatus, AuditEventType } from "@prisma/client";
import { sendTransactionNotification } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function createTransactionAction(input: CreateTransactionInput) {
  try {
    const { session, membership, role } = await requireRole([RoleType.ADMIN, RoleType.MEMBER]);

    if (role === RoleType.GUEST) {
      return { success: false, error: "Guests are not permitted to execute transactions" };
    }

    const validation = CreateTransactionSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || "Validation failed" };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name || "Customer";
    const organizationId = membership.organizationId;
    const reference = `TX-ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Step 1: Atomic database mutation
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          organizationId,
          userId,
          amount: validation.data.amount,
          currency: validation.data.currency || "USD",
          description: validation.data.description,
          reference,
          status: TransactionStatus.COMPLETED,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          eventType: AuditEventType.TRANSACTION_CREATED,
          action: `Server Action created transaction ${reference}`,
          details: {
            amount: validation.data.amount,
            reference,
            organizationId,
          },
        },
      }),
    ]);

    // Step 2: Trigger transactional email dispatch
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
      console.warn("Server action email warning:", emailErr);
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      data: {
        id: transaction.id,
        reference: transaction.reference,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        status: transaction.status,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create transaction via Server Action";
    return { success: false, error: msg };
  }
}
