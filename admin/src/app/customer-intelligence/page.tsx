"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getCustomerIntelligenceActivity,
  getCustomerIntelligencePreferences,
  getCustomerIntelligenceProfile,
} from "@/services/customer-intelligence.service";

export default function CustomerIntelligencePage() {
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId.trim()) return;

    try {
      setLoading(true);

      const [profileRes, activityRes, preferencesRes] =
        await Promise.all([
          getCustomerIntelligenceProfile(userId),
          getCustomerIntelligenceActivity(userId),
          getCustomerIntelligencePreferences(userId),
        ]);

      setProfile(profileRes.data || null);
      setActivity(activityRes.data || []);
      setPreferences(preferencesRes.data || []);
    } catch (error) {
      console.error(error);
      alert("Customer intelligence load failed");
    } finally {
      setLoading(false);
    }
  };

  const summary = profile?.summary || {};
  const styleProfile = profile?.styleProfile;

  const cards = [
    {
      label: "Intelligence Score",
      value: summary.intelligenceScore || 0,
    },
    {
      label: "Total Orders",
      value: summary.totalOrders || 0,
    },
    {
      label: "Saved Looks",
      value: summary.savedLooks || 0,
    },
    {
      label: "Virtual Try-Ons",
      value: summary.tryOns || 0,
    },
    {
      label: "Preferences",
      value: summary.preferences || 0,
    },
    {
      label: "Recommendations",
      value: summary.recommendations || 0,
    },
  ];

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-[1500px] p-6">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Customer Intelligence
          </p>

          <h1 className="mt-2 text-4xl font-black">
            AI Customer Intelligence
          </h1>

          <p className="mt-2 text-zinc-500">
            Analyze customer style, activity, saved looks, try-ons and recommendation signals.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-bold text-zinc-500">
            Customer User ID
          </p>

          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Paste customer userId"
              className="flex-1 rounded-2xl border px-5 py-3 outline-none dark:border-zinc-800 dark:bg-black"
            />

            <button
              onClick={load}
              disabled={loading}
              className="rounded-2xl bg-black px-6 py-3 font-bold text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {loading ? "Loading..." : "Analyze Customer"}
            </button>
          </div>
        </div>

        {!profile ? (
          <div className="rounded-3xl border border-dashed bg-white p-10 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
            Enter a customer userId to load intelligence profile.
          </div>
        ) : (
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <p className="text-sm text-zinc-500">
                    {card.label}
                  </p>

                  <h2 className="mt-3 text-3xl font-black">
                    {card.value}
                  </h2>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-black">
                  Style Profile
                </h2>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
                    Top Category: {styleProfile?.topCategory || "N/A"}
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
                    Top Brand: {styleProfile?.topBrand || "N/A"}
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
                    Preferred Style: {styleProfile?.preferredStyle || "N/A"}
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
                    Personalization Score: {styleProfile?.personalizationScore || 0}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-black">
                  Preferences
                </h2>

                <div className="mt-5 space-y-3">
                  {preferences.length === 0 ? (
                    <p className="text-zinc-500">
                      No preferences found.
                    </p>
                  ) : (
                    preferences.slice(0, 12).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border p-4 dark:border-zinc-800"
                      >
                        <p className="font-bold">
                          {item.key}: {item.value}
                        </p>

                        <p className="text-sm text-zinc-500">
                          Weight: {item.weight} | Source: {item.source || "N/A"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-2xl font-black">
                Activity Timeline
              </h2>

              <div className="mt-5 space-y-4">
                {activity.length === 0 ? (
                  <p className="text-zinc-500">
                    No activity found.
                  </p>
                ) : (
                  activity.slice(0, 20).map((item, index) => (
                    <div
                      key={item.id || index}
                      className="rounded-2xl border p-4 dark:border-zinc-800"
                    >
                      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                        {item.type}
                      </p>

                      <h3 className="mt-1 font-black">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
