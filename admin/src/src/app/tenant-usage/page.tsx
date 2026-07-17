"use client";

import { FormEvent, useState } from "react";
import {
  checkTenantQuota,
  getTenantUsage,
  saveTenantQuota,
} from "../../services/saas-foundation.api";

type Usage = {
  tenantId: string;
  usage: {
    products: number;
    orders: number;
    customers: number;
    aiTokens: number;
    aiCost: number;
  };
};

type QuotaResult = {
  metric: string;
  used: number;
  limit: number;
  remaining: number;
  allowed: boolean;
  reason: string;
};

const metrics = ["products", "orders", "customers", "aiTokens", "storageMb", "staff"];

export default function TenantUsagePage() {
  const [tenantId, setTenantId] = useState("default");
  const [data, setData] = useState<Usage | null>(null);
  const [quotaResults, setQuotaResults] = useState<QuotaResult[]>([]);
  const [status, setStatus] = useState("");

  async function load(event?: FormEvent) {
    event?.preventDefault();
    setStatus("Loading...");
    const result = await getTenantUsage(tenantId);
    const checks = await Promise.all(
      metrics.map((metric) =>
        checkTenantQuota(tenantId, metric).catch(() => null),
      ),
    );

    setData(result);
    setQuotaResults(checks.filter(Boolean));
    setStatus("Ready");
  }

  async function addQuota() {
    await saveTenantQuota({
      tenantId,
      key: "products",
      limit: 500,
      enabled: true,
      meta: {},
    });
    await load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
            Super Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold">Tenant Usage & Quota Guard</h1>
          <form onSubmit={load} className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              className="w-full rounded-2xl border px-4 py-3 dark:border-slate-700 dark:bg-transparent"
              placeholder="Tenant ID"
            />
            <button className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white">
              Load
            </button>
            <button
              type="button"
              onClick={addQuota}
              className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white dark:bg-white dark:text-slate-950"
            >
              Add Product Quota
            </button>
          </form>
          <p className="mt-3 text-sm text-slate-500">{status}</p>
        </section>

        {data ? (
          <section className="grid gap-4 md:grid-cols-5">
            {Object.entries(data.usage).map(([key, value]) => (
              <div key={key} className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
                <p className="text-sm capitalize text-slate-500">{key}</p>
                <h2 className="text-3xl font-bold">{value}</h2>
              </div>
            ))}
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quotaResults.map((item) => {
            const percent =
              item.limit > 0 ? Math.min(100, Math.round((item.used / item.limit) * 100)) : 0;

            return (
              <div key={item.metric} className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold capitalize">{item.metric}</h2>
                  <span className={item.allowed ? "text-green-600" : "text-red-600"}>
                    {item.reason}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Used {item.used} / {item.limit === 0 ? "Unlimited" : item.limit}
                </p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={item.allowed ? "h-full bg-green-600" : "h-full bg-red-600"}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Remaining: {item.limit === 0 ? "Unlimited" : item.remaining}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}