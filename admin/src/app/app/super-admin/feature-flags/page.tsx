"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function SuperAdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/super-admin/feature-flags`)
      .then((r) => r.json())
      .then((d) => setFlags(d.flags || []));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <h1 className="text-2xl font-bold">Super Admin Feature Flags</h1>
      <p className="mb-5 text-sm opacity-70">Safe read shell for feature flag audit.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {flags.map((flag, i) => (
          <section key={flag.id || i} className="rounded-2xl border bg-white p-5 dark:bg-slate-900">
            <h2 className="font-semibold">{flag.name || flag.key || flag.code || flag.id}</h2>
            <p className="text-sm opacity-70">Enabled: {String(flag.enabled)}</p>
            <p className="text-xs opacity-60">Scope: {String(flag.scope || "global")}</p>
          </section>
        ))}
      </div>
    </main>
  );
}