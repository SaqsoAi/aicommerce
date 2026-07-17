"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getOmnichannelAnalytics,
  getOmnichannelHealth,
  getOmnichannelTimeline,
  routeOmnichannelMessage,
} from "@/services/omnichannel.service";

export default function OmnichannelPage() {
  const [health, setHealth] = useState<any>({});
  const [analytics, setAnalytics] = useState<any>({});
  const [timeline, setTimeline] = useState<any>({});
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const [h, a, t] = await Promise.all([
      getOmnichannelHealth(),
      getOmnichannelAnalytics(),
      getOmnichannelTimeline(),
    ]);
    setHealth(h || {});
    setAnalytics(a || {});
    setTimeline(t || {});
  };

  useEffect(() => {
    load();
  }, []);

  const send = async () => {
    await routeOmnichannelMessage({
      channels: ["EMAIL", "PUSH", "IN_APP"],
      receiver,
      message,
      title: "Omnichannel Message",
      eventKey: "OMNICHANNEL_MANUAL",
    });
    await load();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Enterprise Hub
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              Omnichannel Communication Hub
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Route Email, SMS, Push, WhatsApp and In-App messages through existing queue and provider infrastructure.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <pre className="rounded-3xl border border-slate-200 bg-white p-5 text-xs dark:border-slate-800 dark:bg-slate-950">
              {JSON.stringify(health, null, 2)}
            </pre>
            <pre className="rounded-3xl border border-slate-200 bg-white p-5 text-xs dark:border-slate-800 dark:bg-slate-950">
              {JSON.stringify(analytics, null, 2)}
            </pre>
            <pre className="rounded-3xl border border-slate-200 bg-white p-5 text-xs dark:border-slate-800 dark:bg-slate-950">
              {JSON.stringify(timeline, null, 2)}
            </pre>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-bold">Route Test Message</h2>
            <input value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="receiver" className="mt-4 w-full rounded-2xl border p-3 dark:bg-transparent" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="message" className="mt-4 w-full rounded-2xl border p-3 dark:bg-transparent" />
            <button onClick={send} className="mt-4 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">
              Route Message
            </button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
