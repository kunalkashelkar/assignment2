import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assignment 2 - Full-Stack Architecture",
  description:
    "Automated Relational Data Seeding, Transactional Event Notification & Secure Full-Stack Endpoints",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Assignment 2 System
              </span>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium text-slate-400">
              <a href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="/admin" className="hover:text-white transition-colors">
                Admin
              </a>
              <a href="/login" className="hover:text-white transition-colors">
                Login
              </a>
              <a
                href="/api/health"
                target="_blank"
                rel="noreferrer"
                className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono"
              >
                Health Check API ↗
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
