"use client";

import { useEffect, useState } from "react";
import { listFeatureFlags, saveFeatureFlag, seedSaasFoundation } from "../../services/saas-foundation.api";

type Flag = {
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
  scope: string;
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [status, setStatus] = useState("Loading...");

  async function load() {
    const data = await listFeatureFlags();
    setFlags(data || []);
    setStatus("Ready");
  }

  useEffect(() => {
    load().catch((error) => setStatus(error.message));
  }, []);

  async function seed() {
    setStatus("Seeding...");
    await seedSaasFoundation();
    await load();
  }

  async function toggle(flag: Flag) {
    await saveFeatureFlag({ ...flag, enabled: !flag.enabled, config: {} });
    await load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-600">Super Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Feature Flags</h1>
          <p className="mt-2 text-sm text-slate-500">Status: {status}</p>
          <button onClick={seed} className="mt-4 rounded-2xl bg-purple-600 px-5 py-3 font-semibold text-white">Seed Defaults</button>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {flags.map((flag) => (
            <div key={flag.key} className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <h2 className="font-bold">{flag.label}</h2>
              <p className="text-sm text-slate-500">{flag.key}</p>
              <button onClick={() => toggle(flag)} className={flag.enabled ? "mt-4 rounded-xl bg-green-600 px-4 py-2 text-white" : "mt-4 rounded-xl bg-slate-300 px-4 py-2 text-slate-950"}>
                {flag.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}