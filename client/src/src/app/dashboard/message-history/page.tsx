"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  getCustomerMessageHistory,
  type CustomerMessageHistoryItem,
} from "@/services/messaging.service";

export default function MessageHistoryPage() {
  const [logs, setLogs] = useState<CustomerMessageHistoryItem[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    getCustomerMessageHistory()
      .then((res) => setLogs(res.data || []))
      .catch(() => setLogs([]));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return logs;
    return logs.filter((item) => item.channel === filter || item.purpose === filter);
  }, [filter, logs]);

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black">Message History</h1>
          <p className="mt-2 text-sm text-zinc-500">
            View SMS and WhatsApp delivery activity for orders, membership, rewards and campaigns.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/communication-center" className="rounded-xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-zinc-950">
              Communication Center
            </Link>

            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold dark:border-zinc-800 dark:bg-zinc-900">
              <option value="ALL">All</option>
              <option value="SMS">SMS</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="ORDER">Order</option>
              <option value="MEMBERSHIP">Membership</option>
              <option value="REWARD">Reward</option>
              <option value="CAMPAIGN">Campaign</option>
            </select>
          </div>
        </section>

        <section className="overflow-auto rounded-3xl border border-zinc-200 bg-white shadow dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                {["Channel","Receiver","Purpose","Status","Provider","Message ID","Date"].map((heading) => (
                  <th key={heading} className="p-4 text-left text-sm">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="p-4 font-bold">{item.channel}</td>
                  <td className="p-4">{item.phone || item.whatsapp || "-"}</td>
                  <td className="p-4">{item.purpose || "-"}</td>
                  <td className="p-4">{item.deliveryStatus || item.providerStatus || "-"}</td>
                  <td className="p-4">{item.provider || "-"}</td>
                  <td className="p-4">{item.providerMessageId || "-"}</td>
                  <td className="p-4">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-zinc-500">
                    No message history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
