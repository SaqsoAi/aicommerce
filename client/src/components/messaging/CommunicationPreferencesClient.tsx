"use client";

import { useEffect, useState } from "react";

import {
  getLocalCommunicationPreferences,
  saveLocalCommunicationPreferences,
  type CommunicationPreferences,
} from "@/services/messaging.service";

const preferenceItems: Array<{
  key: keyof CommunicationPreferences;
  label: string;
  description: string;
}> = [
  {
    key: "smsNotifications",
    label: "SMS Notifications",
    description: "Receive important updates through SMS.",
  },
  {
    key: "whatsappNotifications",
    label: "WhatsApp Notifications",
    description: "Receive important updates through WhatsApp.",
  },
  {
    key: "orderUpdates",
    label: "Order Updates",
    description: "Order placed, confirmed, shipped and delivered messages.",
  },
  {
    key: "membershipUpdates",
    label: "Membership Updates",
    description: "Membership earned, upgrade and benefit messages.",
  },
  {
    key: "rewardUpdates",
    label: "Reward Updates",
    description: "Reward point earned and redemption messages.",
  },
  {
    key: "marketingMessages",
    label: "Marketing Messages",
    description: "Promotional SMS or WhatsApp campaigns.",
  },
];

export default function CommunicationPreferencesClient() {
  const [preferences, setPreferences] =
    useState<CommunicationPreferences | null>(null);

  useEffect(() => {
    setPreferences(getLocalCommunicationPreferences());
  }, []);

  if (!preferences) {
    return null;
  }

  const updatePreference = (key: keyof CommunicationPreferences) => {
    const next = {
      ...preferences,
      [key]: !preferences[key],
    };

    setPreferences(next);
    saveLocalCommunicationPreferences(next);
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <section className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
          Customer Communication Center
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Communication Preferences
        </h1>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Control how you receive order, membership, rewards and marketing messages.
        </p>

        <div className="mt-8 grid gap-4">
          {preferenceItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => updatePreference(item.key)}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-5 text-left transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-black">{item.label}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {item.description}
                </p>
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
    </main>
  );
}
