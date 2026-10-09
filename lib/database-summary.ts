import prisma from "@/lib/prisma";
import { z } from "zod";

export const DatabaseSummaryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

export type DatabaseSummaryQuery = z.infer<typeof DatabaseSummaryQuerySchema>;

/**
 * Reusable, efficient Prisma queries for database verification and statistics.
 * Aggregations and counts run concurrently with no sensitive data exposed.
 */
export async function getDatabaseSummary(options?: { limit?: number }) {
  const limit = options?.limit ?? 5;

  const [
    userCount,
    organizationCount,
    membershipCount,
    transactionCount,
    auditLogCount,
    emailEventCount,
    transactionAggregate,
    recentTransactions,
    recentAuditLogs,
  ] = await Promise.all([
    // Relational entity counts
    prisma.user.count(),
    prisma.organization.count(),
    prisma.membership.count(),
    prisma.transaction.count(),
    prisma.auditLog.count(),
    prisma.emailEvent.count(),

    // Financial volume aggregations
    prisma.transaction.aggregate({
      _sum: { amount: true },
      _avg: { amount: true },
    }),

    // Filtered transaction projection (sensitive metadata omitted)
    prisma.transaction.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reference: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        organization: {
          select: { name: true, slug: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    }),

    // Recent audit logs
    prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        eventType: true,
        action: true,
        createdAt: true,
        user: {
          select: { email: true },
        },
      },
    }),
  ]);

  return {
    counts: {
      users: userCount,
      organizations: organizationCount,
      memberships: membershipCount,
      transactions: transactionCount,
      auditLogs: auditLogCount,
      emailEvents: emailEventCount,
    },
    transactionTotals: {
      totalVolume: transactionAggregate._sum.amount ? Number(transactionAggregate._sum.amount) : 0,
      averageTicket: transactionAggregate._avg.amount ? Number(transactionAggregate._avg.amount) : 0,
    },
    recentTransactions: recentTransactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
    })),
    recentAuditLogs,
    generatedAt: new Date().toISOString(),
  };
}
