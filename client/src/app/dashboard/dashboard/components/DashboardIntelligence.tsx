"use client";

import { SaqsoCard } from "@/components/saqso";

type Props = {
  orders: any[];
  membership: any;
  rewardWallet: any;
  savedLooks: any[];
  tryOnHistory: any[];
  profile: any;
};

export default function DashboardIntelligence({
  orders,
  membership,
  rewardWallet,
  savedLooks,
  tryOnHistory,
  profile,
}: Props) {
  const totalSpend = orders.reduce(
    (sum, order) => sum + Number(order.finalAmount || 0),
    0
  );

  const delivered = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const profileScore = [
    profile?.name,
    profile?.phone,
    profile?.gender,
    profile?.dateOfBirth,
    profile?.address,
    profile?.whatsapp,
  ].filter(Boolean).length;

  const profilePercent = Math.round((profileScore / 6) * 100);

  const insights = [
    {
      label: "Membership Tier",
      value: membership?.tier || "NONE",
      helper: "Current customer status",
    },
    {
      label: "Reward Points",
      value: rewardWallet?.points || rewardWallet?.balance || 0,
      helper: "Available reward value",
    },
    {
      label: "Saved Looks",
      value: savedLooks.length,
      helper: "Fashion interests saved",
    },
    {
      label: "Try-On History",
      value: tryOnHistory.length,
      helper: "Virtual fitting activity",
    },
  ];

  return (
    <SaqsoCard>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          AI Dashboard Intelligence
        </p>

        <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
          Personal Fashion Summary
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          AI-COMMERCE combines your orders, saved looks, try-ons, membership and rewards into one smart profile.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {insights.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="text-sm text-zinc-500">
              {item.label}
            </p>

            <h3 className="mt-3 text-3xl font-black text-zinc-950 dark:text-white">
              {item.value}
            </h3>

            <p className="mt-2 text-xs text-zinc-500">
              {item.helper}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-black p-5 text-white dark:bg-white dark:text-black">
          <p className="text-xs uppercase tracking-[0.25em] opacity-70">
            Spend Intelligence
          </p>

          <h3 className="mt-3 text-2xl font-black">
            Tk {totalSpend}
          </h3>

          <p className="mt-2 text-sm opacity-70">
            Total tracked spend from your dashboard orders.
          </p>
        </div>

        <div className="rounded-3xl border p-5 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            Order Quality
          </p>

          <h3 className="mt-3 text-2xl font-black text-zinc-950 dark:text-white">
            {delivered}/{orders.length}
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Delivered orders compared with total orders.
          </p>
        </div>

        <div className="rounded-3xl border p-5 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            Profile Strength
          </p>

          <h3 className="mt-3 text-2xl font-black text-zinc-950 dark:text-white">
            {profilePercent}%
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Complete your profile to improve personalization.
          </p>
        </div>
      </div>
    </SaqsoCard>
  );
}
