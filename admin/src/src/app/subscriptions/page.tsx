"use client";

import { useEffect, useState } from "react";
import {
  activateTenantSubscription,
  cancelTenantSubscription,
  changeTenantPlan,
  getSubscriptionReadiness,
  listPlans,
  listTenantSubscriptions,
  savePlan,
  startTenantTrial,
  suspendTenantSubscription,
} from "../../services/saas-foundation.api";

type Plan = {
  key: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
};

type TenantSubscription = {
  id: string;
  tenantId: string;
  planKey: string;
  status: string;
  billingCycle: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
};

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [tenantId, setTenantId] = useState("default");
  const [planKey, setPlanKey] = useState("starter");
  const [status, setStatus] = useState("Loading...");
  const [readiness, setReadiness] = useState<any>(null);

  async function load() {
    const [planData, subscriptionData, readinessData] = await Promise.all([
      listPlans(),
      listTenantSubscriptions(),
      getSubscriptionReadiness(),
    ]);

    setPlans(planData || []);
    setSubscriptions(subscriptionData || []);
    setReadiness(readinessData);
    setStatus("Ready");
  }

  useEffect(() => {
    load().catch((error) => setStatus(error.message));
  }, []);

  async function ensureStarter() {
    await savePlan({
      key: "starter",
      name: "Starter",
      priceMonthly: 1500,
      priceYearly: 15000,
      currency: "BDT",
      active: true,
      sortOrder: 2,
      limits: { products: 500, orders: 1000, aiTokens: 10000, staff: 3 },
      features: { ai_search: true, virtual_tryon: true },
    });
    await load();
  }

  async function run(action: "trial" | "activate" | "change" | "cancel" | "suspend") {
    const payload = { tenantId, planKey, billingCycle: "MONTHLY", trialDays: 14 };

    if (action === "trial") await startTenantTrial(payload);
    if (action === "activate") await activateTenantSubscription(payload);
    if (action === "change") await changeTenantPlan(payload);
    if (action === "cancel") await cancelTenantSubscription({ tenantId, reason: "ADMIN_CANCELLED" });
    if (action === "suspend") await suspendTenantSubscription({ tenantId, reason: "ADMIN_SUSPENDED" });

    await load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Super Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Subscription Engine</h1>
          <p className="mt-2 text-sm text-slate-500">Status: {status}</p>
          <p className="mt-1 text-sm text-slate-500">Readiness: {readiness ? JSON.stringify(readiness) : "Loading"}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <input value={tenantId} onChange={(event) => setTenantId(event.target.value)} className="rounded-2xl border px-4 py-3 dark:border-slate-700 dark:bg-transparent" placeholder="Tenant ID" />
            <input value={planKey} onChange={(event) => setPlanKey(event.target.value)} className="rounded-2xl border px-4 py-3 dark:border-slate-700 dark:bg-transparent" placeholder="Plan Key" />
            <button onClick={ensureStarter} className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white">Ensure Starter Plan</button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => run("trial")} className="rounded-2xl bg-purple-600 px-4 py-2 font-semibold text-white">Start Trial</button>
            <button onClick={() => run("activate")} className="rounded-2xl bg-green-600 px-4 py-2 font-semibold text-white">Activate</button>
            <button onClick={() => run("change")} className="rounded-2xl bg-slate-900 px-4 py-2 font-semibold text-white">Change Plan</button>
            <button onClick={() => run("suspend")} className="rounded-2xl bg-orange-600 px-4 py-2 font-semibold text-white">Suspend</button>
            <button onClick={() => run("cancel")} className="rounded-2xl bg-red-600 px-4 py-2 font-semibold text-white">Cancel</button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold">Plans</h2>
            <div className="mt-4 space-y-3">
              {plans.map((plan) => (
                <div key={plan.key} className="rounded-2xl border p-4 dark:border-slate-800">
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-sm text-slate-500">Monthly: {plan.priceMonthly} | Yearly: {plan.priceYearly}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold">Tenant Subscriptions</h2>
            <div className="mt-4 space-y-3">
              {subscriptions.map((item) => (
                <div key={item.id} className="rounded-2xl border p-4 dark:border-slate-800">
                  <p className="font-semibold">{item.tenantId}</p>
                  <p className="text-sm text-slate-500">Plan: {item.planKey} | Status: {item.status} | Cycle: {item.billingCycle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}