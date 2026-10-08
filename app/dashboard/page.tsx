import { getDatabaseSummary } from "@/lib/database-summary";
import { DatabaseMetricsView } from "@/components/DatabaseMetricsView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDatabaseSummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Operational Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Live relational metrics and data-driven verification via PostgreSQL & Prisma ORM.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
            PostgreSQL Live
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
            MongoDB Ready
          </span>
        </div>
      </div>

      <DatabaseMetricsView summary={summary} />
    </div>
  );
}
