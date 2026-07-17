"use client";

import { useState } from "react";
import {
  queueTestClientPush,
  requestPushPermission,
} from "@/services/pushProvider.service";

export default function NotificationPreferencesPage() {
  const [permission, setPermission] = useState<string>("UNKNOWN");
  const [receiver, setReceiver] = useState("");

  const enablePush = async () => {
    const result = await requestPushPermission();
    setPermission(result);
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-indigo-500">
            Notification Preferences
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Email & Push Preferences
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Manage opt-in and push permission for the enterprise notification system.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-black">Push Permission</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Current status: {permission}
          </p>
          <button
            onClick={enablePush}
            className="mt-4 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black"
          >
            Enable Push Notifications
          </button>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-black">Test Push Queue</h2>
          <input
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="device-token-or-user"
            className="mt-4 w-full rounded-2xl border border-zinc-200 bg-transparent p-3"
          />
          <button
            onClick={() => queueTestClientPush(receiver)}
            className="mt-4 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
          >
            Queue Test Push
          </button>
        </div>
      </section>
    </main>
  );
}
