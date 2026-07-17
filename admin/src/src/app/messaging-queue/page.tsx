"use client";

import { useEffect, useState } from "react";
import { getQueueAnalytics, getQueueItems, processDueQueue, processQueueItem, retryQueueItem } from "@/services/messagingQueue.service";

const statuses = ["", "PENDING", "PROCESSING", "SENT", "RETRY", "FAILED", "DEAD_LETTER"];

export default function MessagingQueuePage() {
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [a, q] = await Promise.all([getQueueAnalytics(), getQueueItems(status || undefined)]);
      setAnalytics(a.data || {});
      setItems(q.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, [status]);

  const action = async (fn: () => Promise<any>) => {
    setLoading(true);
    try { await fn(); await refresh(); } finally { setLoading(false); }
  };

  return (
    <main className="space-y-6 p-6 text-zinc-900 dark:text-zinc-100">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-black">Messaging Queue Monitor</h1>
        <p className="mt-2 text-sm text-zinc-500">Monitor pending, retry and dead-letter message jobs.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {["pending","retry","sent","deadLetter","events"].map((k) => (
            <div key={k} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs uppercase text-zinc-500">{k}</p>
              <p className="mt-1 text-2xl font-black">{analytics[k] ?? 0}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border p-3 dark:bg-zinc-900">
            {statuses.map((s) => <option key={s} value={s}>{s || "ALL"}</option>)}
          </select>
          <button onClick={refresh} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Refresh</button>
          <button onClick={() => action(() => processDueQueue(25))} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">Process Due</button>
        </div>
      </section>

      <section className="overflow-auto rounded-3xl border border-zinc-200 bg-white shadow dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-zinc-100 dark:bg-zinc-900">
            <tr>
              {["Status","Channel","Receiver","Template","Attempts","Error","Created","Action"].map(h => <th key={h} className="p-4 text-left text-sm">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="p-4 font-bold">{item.status}</td>
                <td className="p-4">{item.channel}</td>
                <td className="p-4">{item.receiver}</td>
                <td className="p-4">{item.templateKey || "-"}</td>
                <td className="p-4">{item.attempts}/{item.maxAttempts}</td>
                <td className="p-4">{item.lastError || "-"}</td>
                <td className="p-4">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => action(() => retryQueueItem(item.id))} className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold text-white">Retry</button>
                  <button onClick={() => action(() => processQueueItem(item.id))} className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-bold text-white">Process</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
