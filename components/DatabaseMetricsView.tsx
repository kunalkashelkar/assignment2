import React from "react";

interface DatabaseMetricsViewProps {
  summary: {
    counts: {
      users: number;
      organizations: number;
      memberships: number;
      transactions: number;
      auditLogs: number;
      emailEvents: number;
    };
    transactionTotals: {
      totalVolume: number;
      averageTicket: number;
    };
    recentTransactions: Array<{
      id: string;
      reference: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: Date | string;
      organization: { name: string };
      user: { email: string };
    }>;
    recentAuditLogs: Array<{
      id: string;
      eventType: string;
      action: string;
      createdAt: Date | string;
      user: { email: string } | null;
    }>;
  };
}

export const DatabaseMetricsView: React.FC<DatabaseMetricsViewProps> = ({ summary }) => {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-xs uppercase text-slate-400 font-medium">Organizations</p>
          <p className="text-2xl font-bold text-white mt-1">{summary.counts.organizations}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-xs uppercase text-slate-400 font-medium">Users</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{summary.counts.users}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-xs uppercase text-slate-400 font-medium">Memberships</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{summary.counts.memberships}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-xs uppercase text-slate-400 font-medium">Transactions</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{summary.counts.transactions}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-xs uppercase text-slate-400 font-medium">Audit Logs</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{summary.counts.auditLogs}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-xs uppercase text-slate-400 font-medium">Email Events</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{summary.counts.emailEvents}</p>
        </div>
      </div>

      {/* Aggregate Volume */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
          <h4 className="text-xs uppercase text-slate-400 tracking-wider">Total Transaction Volume</h4>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">
            ${summary.transactionTotals.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
          <h4 className="text-xs uppercase text-slate-400 tracking-wider">Average Ticket Size</h4>
          <p className="text-3xl font-extrabold text-slate-200 mt-2">
            ${summary.transactionTotals.averageTicket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Live Relational Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="pb-2">Reference</th>
                  <th className="pb-2">Tenant</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {summary.recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-2 text-slate-200">{tx.reference}</td>
                    <td className="py-2">{tx.organization.name}</td>
                    <td className="py-2 text-emerald-300">${tx.amount.toFixed(2)}</td>
                    <td className="py-2">{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Recent Security & Audit Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="pb-2">Event</th>
                  <th className="pb-2">User Email</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {summary.recentAuditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 text-indigo-300">{log.eventType}</td>
                    <td className="py-2">{log.user?.email || "System"}</td>
                    <td className="py-2 text-slate-300">{log.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
