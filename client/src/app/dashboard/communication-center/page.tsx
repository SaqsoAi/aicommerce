"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  communicationPreferenceLabels,
  getCustomerQueueAnalytics,
  getLocalCommunicationPreferences,
  saveLocalCommunicationPreferences,
  type CommunicationPreferences,
} from "@/services/messaging.service";

export default function CommunicationCenterPage() {
  const [preferences, setPreferences] = useState<CommunicationPreferences | null>(null);
  const [analytics, setAnalytics] = useState<any>({});

  useEffect(() => {
    setPreferences(getLocalCommunicationPreferences());

    getCustomerQueueAnalytics()
      .then((res) => setAnalytics(res.data || {}))
      .catch(() => setAnalytics({}));
  }, []);

  if (!preferences) return null;

  const toggle = (key: keyof CommunicationPreferences) => {
    const next = {
      ...preferences,
      [key]: !preferences[key],
    };

    setPreferences(next);
    saveLocalCommunicationPreferences(next);
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black">Communication Center</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Manage SMS, WhatsApp, order, membership, reward and cart recovery preferences.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold dark:border-zinc-800">
              Back to Dashboard
            </Link>
            <Link href="/dashboard/message-history" className="rounded-xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-zinc-950">
              Message History
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Pending", analytics.pending ?? 0],
            ["Retry", analytics.retry ?? 0],
            ["Sent", analytics.sent ?? 0],
            ["Dead Letter", analytics.deadLetter ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-black">{String(value)}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-2xl font-black">Communication Preferences</h2>

          <div className="mt-6 grid gap-4">
            {communicationPreferenceLabels.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => toggle(item.key)}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-5 text-left transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-black">{item.label}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-black ${
                    preferences[item.key]
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {preferences[item.key] ? "ON" : "OFF"}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
