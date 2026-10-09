export default function HomePage() {
  return (
    <div className="space-y-8 py-10">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl backdrop-blur-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-700/40 mb-4">
          Assignment 2 Baseline
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Automated Relational Data Seeding, Transactional Event Notification & Secure Full-Stack Endpoints
        </h1>
        <p className="text-slate-400 max-w-2xl leading-relaxed">
          Project foundation successfully provisioned with Next.js App Router, TypeScript strict mode, Prisma ORM with PostgreSQL, Mongoose with MongoDB, Zod validation, and transactional email setup.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">
              CO3 Target
            </h2>
            <p className="text-xs text-slate-400">
              Execute secure authorization and multi-tenant session validation via Better Auth and Next.js Proxy/Middleware layers.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">
              CO4 Target
            </h2>
            <p className="text-xs text-slate-400">
              Deploy data-driven endpoints connecting relational platforms via Prisma ORM and object databases via Mongoose.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
