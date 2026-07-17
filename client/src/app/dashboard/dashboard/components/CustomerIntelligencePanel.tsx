"use client";

import { useEffect, useMemo, useState } from "react";
import { SaqsoCard } from "@/components/saqso";
import {
  getMyCustomerIntelligenceActivity,
  getMyCustomerIntelligenceProfile,
  getMyCustomerPreferences,
  refreshMyStyleProfile,
  saveMyCustomerPreference,
} from "@/services/customer-intelligence.service";

type Props = {
  user: any;
};

const preferenceOptions = [
  {
    key: "style",
    values: ["Luxury", "Street", "Modern", "Ethnic", "Minimal"],
  },
  {
    key: "fit",
    values: ["Slim", "Regular", "Relaxed", "Oversized"],
  },
  {
    key: "occasion",
    values: ["Daily", "Office", "Wedding", "Party", "Travel"],
  },
];

export default function CustomerIntelligencePanel({ user }: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = user?.id;

  const load = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const [profileRes, activityRes, preferenceRes] =
        await Promise.all([
          getMyCustomerIntelligenceProfile(userId),
          getMyCustomerIntelligenceActivity(userId),
          getMyCustomerPreferences(userId),
        ]);

      setProfile(profileRes.data || null);
      setActivity(activityRes.data || []);
      setPreferences(preferenceRes.data || []);
    } catch (error) {
      console.error("Customer intelligence load failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const savePreference = async (key: string, value: string) => {
    if (!userId) return;

    try {
      await saveMyCustomerPreference(userId, {
        key,
        value,
        weight: 5,
        source: "CUSTOMER_DASHBOARD",
      });

      await refreshMyStyleProfile(userId);
      await load();
    } catch (error) {
      console.error("Preference save failed", error);
      alert("Preference save failed");
    }
  };

  const summary = profile?.summary || {};
  const styleProfile = profile?.styleProfile;

  const selectedPreferences = useMemo(() => {
    const map = new Map<string, string[]>();

    preferences.forEach((item) => {
      const list = map.get(item.key) || [];
      list.push(item.value);
      map.set(item.key, list);
    });

    return map;
  }, [preferences]);

  return (
    <SaqsoCard>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            AI Customer Intelligence
          </p>

          <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
            Your Style Intelligence
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            AI-COMMERCE learns from your preferences, saved looks, try-ons and orders.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="rounded-full border px-4 py-2 text-sm font-bold dark:border-zinc-700"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl bg-black p-5 text-white dark:bg-white dark:text-black">
          <p className="text-sm opacity-70">
            Intelligence Score
          </p>

          <h3 className="mt-3 text-3xl font-black">
            {summary.intelligenceScore || 0}
          </h3>
        </div>

        <div className="rounded-3xl border p-5 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">
            Top Category
          </p>

          <h3 className="mt-3 text-xl font-black text-zinc-950 dark:text-white">
            {styleProfile?.topCategory || "Learning"}
          </h3>
        </div>

        <div className="rounded-3xl border p-5 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">
            Top Brand
          </p>

          <h3 className="mt-3 text-xl font-black text-zinc-950 dark:text-white">
            {styleProfile?.topBrand || "Learning"}
          </h3>
        </div>

        <div className="rounded-3xl border p-5 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">
            Preferred Style
          </p>

          <h3 className="mt-3 text-xl font-black text-zinc-950 dark:text-white">
            {styleProfile?.preferredStyle || "Not set"}
          </h3>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border p-5 dark:border-zinc-800">
          <h3 className="text-xl font-black text-zinc-950 dark:text-white">
            Preference Center
          </h3>

          <div className="mt-5 space-y-5">
            {preferenceOptions.map((group) => (
              <div key={group.key}>
                <p className="mb-3 text-xs uppercase tracking-[0.25em] text-zinc-500">
                  {group.key}
                </p>

                <div className="flex flex-wrap gap-2">
                  {group.values.map((value) => {
                    const active =
                      selectedPreferences.get(group.key)?.includes(value);

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => savePreference(group.key, value)}
                        className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                          active
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "dark:border-zinc-700"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border p-5 dark:border-zinc-800">
          <h3 className="text-xl font-black text-zinc-950 dark:text-white">
            Intelligence Timeline
          </h3>

          <div className="mt-5 space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Your intelligence timeline is still learning.
              </p>
            ) : (
              activity.slice(0, 8).map((item, index) => (
                <div
                  key={item.id || index}
                  className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                    {item.type}
                  </p>

                  <h4 className="mt-1 font-black text-zinc-950 dark:text-white">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-xs text-zinc-500">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "Recently"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SaqsoCard>
  );
}
