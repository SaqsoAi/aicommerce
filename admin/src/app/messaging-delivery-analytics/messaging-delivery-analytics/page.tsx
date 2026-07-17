"use client";

import { useEffect, useState } from "react";
import { getQueueAnalytics, getQueueEvents } from "@/services/messagingQueue.service";

export default function MessagingDeliveryAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>({});
  const [events, setEvents] = useState<any[]>([]);

  const refresh = async () => {
    const [a, e] = await Promise.all([getQueueAnalytics(), getQueueEvents()]);
    setAnalytics(a.data || {});
    setEvents(e.data || []);
  };

  useEffect(() => { void refresh(); }, []);

  return (
    <main className="space-y-6 p-6 text-zinc-900 dark:text-zinc-100">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-black">Messaging Delivery Analytics</h1>
        <p className="mt-2 text-sm text-zinc-500">Queue health, event volume, retry and dead-letter reporting.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {["pending","retry","sent","deadLetter","events"].map((k) => (
            <div key={k} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs uppercase text-zinc-500">{k}</p>
              <p className="mt-1 text-2xl font-black">{analytics[k] ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-auto rounded-3xl border border-zinc-200 bg-white shadow dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[900px]">
          <thead className="bg-zinc-100 dark:bg-zinc-900">
            <tr>
              {["Event","Entity","Status","Channel","Queues","Created"].map(h => <th key={h} className="p-4 text-left text-sm">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="p-4 font-bold">{event.eventKey}</td>
                <td className="p-4">{event.entityType} / {event.entityId || "-"}</td>
                <td className="p-4">{event.status}</td>
                <td className="p-4">{event.channel || "-"}</td>
                <td className="p-4">{event.queues?.length || 0}</td>
                <td className="p-4">{new Date(event.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
