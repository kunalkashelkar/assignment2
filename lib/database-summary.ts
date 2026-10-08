import prisma from "@/lib/prisma";

export async function getDatabaseSummary() {
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
    prisma.user.count(),
    prisma.organization.count(),
    prisma.membership.count(),
    prisma.transaction.count(),
    prisma.auditLog.count(),
    prisma.emailEvent.count(),
    prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      _avg: {
        amount: true,
      },
    }),
    prisma.transaction.findMany({
      take: 5,
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
    prisma.auditLog.findMany({
      take: 5,
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
