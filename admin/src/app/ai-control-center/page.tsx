"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createAiOverride,
  getAiDashboard,
  seedAiControl,
  updateAiFeature,
  updateAiProvider,
} from "../../services/ai-control.api";

type Feature = {
  id: string;
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
  placement?: string[];
};

type Provider = {
  id: string;
  key: string;
  name: string;
  model?: string;
  apiKeyEnv?: string;
  enabled: boolean;
  priority: number;
};

type UsageSummary = {
  featureKey: string;
  _count?: { id?: number };
  _sum?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    cost?: number;
  };
};

type Dashboard = {
  features: Feature[];
  providers: Provider[];
  usageSummary: UsageSummary[];
  recentUsage: Array<Record<string, unknown>>;
  overrides: Array<Record<string, unknown>>;
};

export default function AiControlCenterPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [status, setStatus] = useState("Loading AI Control Center...");
  const [overrideTarget, setOverrideTarget] = useState("");
  const [overrideFeature, setOverrideFeature] = useState("product_recommendation");
  const [overrideValue, setOverrideValue] = useState("featured=true");

  async function load() {
    setStatus("Loading AI Control Center...");
    const data = await getAiDashboard();
    setDashboard(data);
    setStatus("Ready");
  }

  useEffect(() => {
    load().catch((error) => setStatus(error.message));
  }, []);

  const totalTokens = useMemo(() => {
    return (
      dashboard?.usageSummary?.reduce((sum, item) => {
        return sum + Number(item._sum?.totalTokens || 0);
      }, 0) || 0
    );
  }, [dashboard]);

  async function handleSeed() {
    setStatus("Seeding defaults...");
    await seedAiControl();
    await load();
  }

  async function toggleFeature(feature: Feature) {
    setStatus(`Updating ${feature.label}...`);
    await updateAiFeature(feature.key, {
      enabled: !feature.enabled,
      label: feature.label,
      description: feature.description,
      placement: feature.placement || [],
    });
    await load();
  }

  async function toggleProvider(provider: Provider) {
    setStatus(`Updating ${provider.name}...`);
    await updateAiProvider(provider.key, {
      enabled: !provider.enabled,
      name: provider.name,
      model: provider.model,
      apiKeyEnv: provider.apiKeyEnv,
      priority: provider.priority,
    });
    await load();
  }

  async function submitOverride() {
    setStatus("Saving override...");
    await createAiOverride({
      featureKey: overrideFeature,
      targetType: "PRODUCT",
      targetId: overrideTarget,
      value: {
        raw: overrideValue,
      },
      reason: "Super Admin manual override",
      active: true,
    });
    setOverrideTarget("");
    await load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-600">
            Super Admin
          </p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Control Center</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
                Manage AI feature toggles, providers, usage logs, analytics, and manual prediction overrides from one place.
              </p>
            </div>
            <button
              onClick={handleSeed}
              className="rounded-2xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
            >
              Seed Defaults
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-500">{status}</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Enabled Features</p>
            <h2 className="mt-2 text-3xl font-bold">
              {dashboard?.features?.filter((item) => item.enabled).length || 0}
            </h2>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Enabled Providers</p>
            <h2 className="mt-2 text-3xl font-bold">
              {dashboard?.providers?.filter((item) => item.enabled).length || 0}
            </h2>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Total Tokens</p>
            <h2 className="mt-2 text-3xl font-bold">{totalTokens}</h2>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold">AI Feature Toggles</h2>
            <div className="mt-5 space-y-3">
              {dashboard?.features?.map((feature) => (
                <div
                  key={feature.key}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{feature.label}</h3>
                    <p className="text-sm text-slate-500">{feature.description}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Placement: {(feature.placement || []).join(", ") || "Not set"}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFeature(feature)}
                    className={
                      feature.enabled
                        ? "rounded-2xl bg-green-600 px-4 py-2 font-semibold text-white"
                        : "rounded-2xl bg-slate-300 px-4 py-2 font-semibold text-slate-950"
                    }
                  >
                    {feature.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold">AI Providers</h2>
            <div className="mt-5 space-y-3">
              {dashboard?.providers?.map((provider) => (
                <div
                  key={provider.key}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-sm text-slate-500">
                      Model: {provider.model || "Not set"} | Env: {provider.apiKeyEnv || "None"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Priority: {provider.priority}</p>
                  </div>
                  <button
                    onClick={() => toggleProvider(provider)}
                    className={
                      provider.enabled
                        ? "rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white"
                        : "rounded-2xl bg-slate-300 px-4 py-2 font-semibold text-slate-950"
                    }
                  >
                    {provider.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold">Usage Analytics</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">Feature</th>
                    <th className="py-2">Calls</th>
                    <th className="py-2">Tokens</th>
                    <th className="py-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard?.usageSummary?.map((item) => (
                    <tr key={item.featureKey} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="py-3">{item.featureKey}</td>
                      <td className="py-3">{item._count?.id || 0}</td>
                      <td className="py-3">{item._sum?.totalTokens || 0}</td>
                      <td className="py-3">{item._sum?.cost || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold">Manual AI Override</h2>
            <div className="mt-5 space-y-3">
              <input
                value={overrideFeature}
                onChange={(event) => setOverrideFeature(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 dark:border-slate-700"
                placeholder="Feature key"
              />
              <input
                value={overrideTarget}
                onChange={(event) => setOverrideTarget(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 dark:border-slate-700"
                placeholder="Target product/customer/order ID"
              />
              <textarea
                value={overrideValue}
                onChange={(event) => setOverrideValue(event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-3 dark:border-slate-700"
                placeholder="Override value"
              />
              <button
                onClick={submitOverride}
                className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white dark:bg-white dark:text-slate-950"
              >
                Save Override
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}