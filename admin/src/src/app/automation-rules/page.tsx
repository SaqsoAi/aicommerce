"use client";

import { useEffect, useMemo, useState } from "react";
import {
  businessAutomationRuleGroups,
  getBusinessAutomationHealth,
  getBusinessAutomationRules,
  triggerAbandonedCartAutomation,
  triggerMembershipAutomation,
  triggerOrderAutomation,
  triggerRewardAutomation,
} from "@/services/businessEventAutomation.service";

type QueueStatus = {
  total?: number;
  pending?: number;
  totalPending?: number;
  processing?: number;
  completed?: number;
  failed?: number;
  totalFailed?: number;
  retry?: number;
  totalRetry?: number;
  deadLetter?: number;
};

const demoPayload = {
  userId: "admin-test-user",
  orderId: "admin-test-order",
  membershipId: "admin-test-membership",
  rewardId: "admin-test-reward",
  cartId: "admin-test-cart",
  receiver: "01700000000",
};

export default function AutomationRulesPage() {
  const [health, setHealth] = useState<any>(null);
  const [rules, setRules] = useState<any>(null);
  const [queue, setQueue] = useState<QueueStatus>({});
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState("");
  const [message, setMessage] = useState("");

  const totalRules = useMemo(() => {
    return businessAutomationRuleGroups.reduce(
      (sum, group) => sum + group.events.length,
      0
    );
  }, []);

  const load = async () => {
    setLoading(true);
    setMessage("");

    try {
      const [healthRes, rulesRes] = await Promise.allSettled([
        getBusinessAutomationHealth(),
        getBusinessAutomationRules(),
      ]);

      if (healthRes.status === "fulfilled") setHealth(healthRes.value);
      if (rulesRes.status === "fulfilled") setRules(rulesRes.value);

      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
          }/messaging-queue/analytics`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (res.ok) {
          const data = await res.json();
          setQueue(data?.analytics || data || {});
        }
      } catch {
        setQueue({});
      }
    } catch (error: any) {
      setMessage(error?.message || "Automation dashboard load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const testTrigger = async (type: "order" | "membership" | "reward" | "cart") => {
    setTesting(type);
    setMessage("");

    try {
      if (type === "order") await triggerOrderAutomation(demoPayload);
      if (type === "membership") await triggerMembershipAutomation(demoPayload);
      if (type === "reward") await triggerRewardAutomation(demoPayload);
      if (type === "cart") await triggerAbandonedCartAutomation(demoPayload);

      setMessage(`${type.toUpperCase()} automation test queued successfully`);
      await load();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          `${type} automation test failed`
      );
    } finally {
      setTesting("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Phase 4.0I-K.2
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Automation Rules Dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Business event automation control for orders, cart recovery,
                membership, rewards, messaging queue and scheduler monitoring.
              </p>
            </div>

            <button
              onClick={load}
              className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg hover:bg-cyan-300"
            >
              Refresh Dashboard
            </button>
          </div>
        </section>

        {message && (
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-100">
            {message}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Automation Rules" value={totalRules} />
          <StatCard
            title="Server Health"
            value={health?.success === false ? "FAIL" : "PASS"}
          />
          <StatCard
            title="Queue Pending"
            value={queue.pending ?? queue.totalPending ?? 0}
          />
          <StatCard
            title="Queue Failed"
            value={queue.failed ?? queue.totalFailed ?? 0}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {businessAutomationRuleGroups.map((group) => (
            <div
              key={group.title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {group.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    {group.description}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  ACTIVE
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {group.events.map((event) => (
                  <div
                    key={event}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">{event}</p>
                      <p className="text-xs text-slate-400">
                        SMS + WhatsApp queue supported
                      </p>
                    </div>
                    <span className="rounded-xl bg-white/10 px-3 py-1 text-xs text-slate-200">
                      Enabled
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-bold">Scheduler Monitor</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatCard title="Total Queue" value={queue.total ?? 0} compact />
              <StatCard
                title="Processing"
                value={queue.processing ?? 0}
                compact
              />
              <StatCard
                title="Completed"
                value={queue.completed ?? 0}
                compact
              />
              <StatCard
                title="Retry"
                value={queue.retry ?? queue.totalRetry ?? 0}
                compact
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-bold">Trigger Test Center</h2>
            <p className="mt-1 text-sm text-slate-300">
              Sends safe admin test payload to existing server endpoints.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <TriggerButton
                label="Test Order Event"
                active={testing === "order"}
                onClick={() => testTrigger("order")}
              />
              <TriggerButton
                label="Test Membership Event"
                active={testing === "membership"}
                onClick={() => testTrigger("membership")}
              />
              <TriggerButton
                label="Test Reward Event"
                active={testing === "reward"}
                onClick={() => testTrigger("reward")}
              />
              <TriggerButton
                label="Test Cart Recovery"
                active={testing === "cart"}
                onClick={() => testTrigger("cart")}
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-bold">Raw Rules Response</h2>
          <pre className="mt-4 max-h-80 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-300">
            {loading
              ? "Loading..."
              : JSON.stringify({ health, rules, queue }, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  compact,
}: {
  title: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function TriggerButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={active}
      onClick={onClick}
      className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20 disabled:opacity-60"
    >
      {active ? "Processing..." : label}
    </button>
  );
}