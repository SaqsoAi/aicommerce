"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function SuperAdminProviderControlPage() {
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/super-admin/provider-control`)
      .then((r) => r.json())
      .then((d) => setProviders(d.providers || []));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <h1 className="text-2xl font-bold">Super Admin Provider Control</h1>
      <p className="mb-5 text-sm opacity-70">Google, Facebook, Email, OTP and Guest Checkout provider visibility.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider, i) => (
          <section key={provider.id || i} className="rounded-2xl border bg-white p-5 dark:bg-slate-900">
            <h2 className="font-semibold">{provider.name || provider.key}</h2>
            <p className="text-sm opacity-70">Enabled: {String(provider.enabled)}</p>
            <p className="text-sm opacity-70">Required: {String(provider.required)}</p>
          </section>
        ))}
      </div>
    </main>
  );
}