"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getNotificationProviderHealth,
  getNotificationProviders,
  saveNotificationProvider,
  sendTestEmail,
  sendTestPush,
} from "@/services/notificationProvider.service";

export default function NotificationProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [health, setHealth] = useState<any[]>([]);
  const [emailTo, setEmailTo] = useState("");
  const [pushReceiver, setPushReceiver] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [providerList, healthList] = await Promise.all([
      getNotificationProviders(),
      getNotificationProviderHealth(),
    ]);

    setProviders(Array.isArray(providerList) ? providerList : []);
    setHealth(Array.isArray(healthList) ? healthList : []);
  };

  useEffect(() => {
    load();
  }, []);

  const seedDefaults = async () => {
    setBusy(true);
    try {
      await saveNotificationProvider({
        key: "smtp_primary",
        name: "SMTP Primary",
        category: "EMAIL",
        enabled: true,
        description: "Primary SMTP email provider",
        credentials: {
          host: "",
          port: "",
          user: "",
          password: "",
        },
      });

      await saveNotificationProvider({
        key: "web_push_primary",
        name: "Web Push Primary",
        category: "PUSH",
        enabled: false,
        description: "Primary web push provider",
        credentials: {
          publicKey: "",
          privateKey: "",
        },
      });

      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Provider Control Center
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              Email & Push Providers
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage SMTP and push provider registry using existing Integration Provider architecture.
            </p>

            <button
              onClick={seedDefaults}
              disabled={busy}
              className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              Create Default Providers
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {health.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <p className="text-sm text-slate-500">{item.category}</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                  {item.name}
                </h2>
                <p className="mt-2 text-sm">
                  Status: <b>{item.status}</b>
                </p>
                <p className="text-sm text-slate-500">
                  Configured Credentials: {item.configuredCredentials}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-bold">Send Test Email</h2>
              <input
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="customer@example.com"
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-transparent p-3"
              />
              <button
                onClick={() => sendTestEmail(emailTo)}
                className="mt-4 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Queue Test Email
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-bold">Send Test Push</h2>
              <input
                value={pushReceiver}
                onChange={(e) => setPushReceiver(e.target.value)}
                placeholder="device-token-or-user"
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-transparent p-3"
              />
              <button
                onClick={() => sendTestPush(pushReceiver)}
                className="mt-4 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Queue Test Push
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-bold">Provider Registry</h2>
            <pre className="mt-4 overflow-auto rounded-2xl bg-slate-100 p-4 text-xs dark:bg-slate-900">
              {JSON.stringify(providers, null, 2)}
            </pre>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
