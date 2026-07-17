"use client";

import { useEffect, useState } from "react";

type Setting = {
  id: string;
  key: string;
  value: string;
};

type Provider = {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  required: boolean;
  sortOrder: number;
  settings: Setting[];
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AuthProviderCenterPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`${API}/auth-providers`, { cache: "no-store" });
    const data = await res.json();
    setProviders(data.providers || []);
    setLoading(false);
  };

  const seed = async () => {
    await fetch(`${API}/auth-providers/seed`, { method: "POST" });
    await load();
  };

  const patch = async (provider: Provider, data: Partial<Provider>) => {
    await fetch(`${API}/auth-providers/${provider.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await load();
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Auth Provider Center</h1>
          <p className="text-sm opacity-70">
            Super Admin controls Email, Google, Facebook, OTP and Guest Checkout login options.
          </p>
        </div>

        <button
          onClick={seed}
          className="rounded-xl bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
        >
          Seed Auth Providers
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border p-5">Loading...</div>
      ) : providers.length === 0 ? (
        <div className="rounded-xl border bg-white p-5 dark:bg-slate-900">
          No providers found. Click <b>Seed Auth Providers</b>.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {providers.map((provider) => (
            <section
              key={provider.id}
              className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{provider.name}</h2>
                <p className="text-xs opacity-60">{provider.key}</p>
                <p className="mt-1 text-sm opacity-70">{provider.description}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => patch(provider, { enabled: !provider.enabled })}
                  className="rounded-lg border px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {provider.enabled ? "Enabled" : "Disabled"}
                </button>

                <button
                  onClick={() => patch(provider, { required: !provider.required })}
                  className="rounded-lg border px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {provider.required ? "Required" : "Optional"}
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-slate-100 p-3 text-xs dark:bg-slate-800">
                {provider.settings?.length ? (
                  provider.settings.map((setting) => (
                    <div key={setting.id} className="flex justify-between gap-3 py-1">
                      <span>{setting.key}</span>
                      <span className="opacity-70">{setting.value}</span>
                    </div>
                  ))
                ) : (
                  <span>No settings</span>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}