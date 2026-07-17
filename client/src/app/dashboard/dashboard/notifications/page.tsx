"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClientNotification,
  getClientNotifications,
  getClientNotificationHistory,
  getClientUnreadNotificationCount,
  markAllClientNotificationsRead,
  markClientNotificationRead,
} from "@/services/notification.service";

export default function NotificationsPage() {
  const [items, setItems] = useState<ClientNotification[]>([]);
  const [history, setHistory] = useState<ClientNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [list, historyList, count] = await Promise.all([
        getClientNotifications(),
        getClientNotificationHistory(),
        getClientUnreadNotificationCount(),
      ]);
      setItems(list);
      setHistory(historyList);
      setUnread(count);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => ({
    total: items.length,
    unread,
    read: items.filter((item) => item.isRead).length,
    history: history.length,
  }), [items, unread, history]);

  const readOne = async (id: string) => {
    setBusy(true);
    try {
      await markClientNotificationRead(id);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const readAll = async () => {
    setBusy(true);
    try {
      await markAllClientNotificationsRead();
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-min-min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-indigo-500">
            Dashboard
          </p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl font-black">Notifications</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Your notification center is connected with the Enterprise Messaging Center.
              </p>
            </div>
            <button
              onClick={readAll}
              disabled={busy || loading}
              className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 dark:bg-white dark:text-black"
            >
              Mark All Read
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total", stats.total],
            ["Unread", stats.unread],
            ["Read", stats.read],
            ["History", stats.history],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-2 text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2">
          <Link href="/communication-center" className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
            <p className="font-black">Communication Center</p>
            <p className="mt-1 text-sm text-zinc-500">
              View order, membership, reward and automation timeline.
            </p>
          </Link>

          <Link href="/dashboard/message-history" className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
            <p className="font-black">Message History</p>
            <p className="mt-1 text-sm text-zinc-500">
              View sent, delivered, failed and campaign message records.
            </p>
          </Link>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white shadow dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-xl font-black">Recent Notifications</h2>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-zinc-500">Loading notifications...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-zinc-500">No notifications found.</div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black">{item.title}</h3>
                      {!item.isRead && (
                        <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">{item.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-zinc-400">
                      {item.type} Â· {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!item.isRead && (
                    <button
                      onClick={() => readOne(item.id)}
                      disabled={busy}
                      className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

