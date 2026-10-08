import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/authorization";
import { RoleType } from "@prisma/client";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const reqHeaders = await headers();

  let authContext;
  try {
    // Requires ADMIN role
    authContext = await requireRole([RoleType.ADMIN], undefined, reqHeaders);
  } catch {
    redirect("/dashboard?error=unauthorized_admin_access");
  }

  // Fetch admin audit logs
  const auditLogs = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Console</h1>
          <p className="text-sm text-slate-400 mt-1">
            Privileged administrative area restricted to ADMIN role.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-500/40 text-rose-300">
          Admin Verified: {authContext.session.user.email}
        </span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Security Audit Stream</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="text-slate-300 border-b border-slate-800">
              <tr>
                <th className="pb-3">Event Type</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">User</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 text-amber-300">{log.eventType}</td>
                  <td className="py-2.5 text-slate-200">{log.action}</td>
                  <td className="py-2.5">{log.user?.email || "System"}</td>
                  <td className="py-2.5">{log.ipAddress || "Internal"}</td>
                  <td className="py-2.5 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
