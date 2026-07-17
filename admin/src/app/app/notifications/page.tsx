"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  AdminNotification,
  getNotifications,
  getNotificationHistory,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service";

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<AdminNotification[]>([]);
  const [history, setHistory] =
    useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [list, historyList, unread] =
        await Promise.all([
          getNotifications(),
          getNotificationHistory(),
          getUnreadNotificationCount(),
        ]);

      setNotifications(Array.isArray(list) ? list : []);
      setHistory(Array.isArray(historyList) ? historyList : []);
      setUnreadCount(Number(unread || 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = unreadCount;
    const read = notifications.filter((item) => item.isRead).length;
    const system = notifications.filter(
      (item) => item.type?.toLowerCase() === "system"
    ).length;

    return {
      total,
      unread,
      read,
      system,
      history: history.length,
    };
  }, [notifications, history, unreadCount]);

  const handleRead = async (id: string) => {
    try {
      setActionLoading(true);
      await markNotificationRead(id);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReadAll = async () => {
    try {
      setActionLoading(true);
      await markAllNotificationsRead();
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
                  Enterprise Notification Center
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  Notifications
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Monitor in-app notifications, unread status, delivery activity and recent customer communication.
                </p>
              </div>

              <button
                onClick={handleReadAll}
                disabled={actionLoading || loading}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] disabled:opacity-50 dark:bg-white dark:text-slate-950"
              >
                Mark All Read
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Total", stats.total],
              ["Unread", stats.unread],
              ["Read", stats.read],
              ["System", stats.system],
              ["History", stats.history],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Notifications
              </h2>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                No notifications found.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                        {!item.isRead && (
                          <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                            Unread
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.message}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                        {item.type} · {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {!item.isRead && (
                      <button
                        onClick={() => handleRead(item.id)}
                        disabled={actionLoading}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Channel Settings Preview
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Email, SMS, WhatsApp, Push and In-App channel configuration will reuse existing messaging infrastructure and notification APIs.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Email", "SMS", "WhatsApp", "Push", "In-App"].map((channel) => (
                  <div
                    key={channel}
                    className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {channel}
                    </p>
                    <p className="text-sm text-emerald-600">
                      Ready for settings API
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Queue Monitor Reuse
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Delivery queue monitoring remains connected to the existing Messaging Queue module. No duplicate queue engine has been created.
              </p>
              <a
                href="/messaging-queue"
                className="mt-4 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                Open Messaging Queue
              </a>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}