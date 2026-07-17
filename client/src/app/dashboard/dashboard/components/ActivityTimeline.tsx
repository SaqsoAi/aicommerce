"use client";

import { SaqsoCard } from "@/components/saqso";

type Props = {
  orders: any[];
  savedLooks: any[];
  tryOnHistory: any[];
  rewardWallet: any;
  membership: any;
};

export default function ActivityTimeline({
  orders,
  savedLooks,
  tryOnHistory,
  rewardWallet,
  membership,
}: Props) {
  const orderEvents = orders.slice(0, 3).map((order) => ({
    type: "Order",
    title: `Order ${order.status || "UPDATED"}`,
    subtitle: `Order ID: ${order.id}`,
    time: order.createdAt,
  }));

  const savedLookEvents = savedLooks.slice(0, 3).map((item) => ({
    type: "Saved Look",
    title: item.lookbook?.title || "Saved a lookbook",
    subtitle: "Added to your style memory",
    time: item.createdAt,
  }));

  const tryOnEvents = tryOnHistory.slice(0, 3).map((item) => ({
    type: "Try-On",
    title: item.product?.name || "Virtual try-on",
    subtitle: item.status || "Try-on activity",
    time: item.createdAt,
  }));

  const rewardEvents = rewardWallet
    ? [
        {
          type: "Rewards",
          title: "Reward wallet active",
          subtitle: `${rewardWallet.points || rewardWallet.balance || 0} points available`,
          time: new Date().toISOString(),
        },
      ]
    : [];

  const membershipEvents = membership
    ? [
        {
          type: "Membership",
          title: `${membership.tier || "Member"} membership`,
          subtitle: "Membership profile connected",
          time: new Date().toISOString(),
        },
      ]
    : [];

  const events = [
    ...orderEvents,
    ...savedLookEvents,
    ...tryOnEvents,
    ...rewardEvents,
    ...membershipEvents,
  ]
    .filter((item) => item.time)
    .sort(
      (a, b) =>
        new Date(b.time).getTime() -
        new Date(a.time).getTime()
    )
    .slice(0, 10);

  const insights = [
    savedLooks.length > 0
      ? `You saved ${savedLooks.length} look${savedLooks.length > 1 ? "s" : ""}.`
      : "Save looks from lookbooks to improve your recommendations.",
    tryOnHistory.length > 0
      ? `You completed ${tryOnHistory.length} virtual try-on activities.`
      : "Try products virtually to build your fit memory.",
    membership?.tier
      ? `Your current membership tier is ${membership.tier}.`
      : "Complete your profile and orders to unlock membership benefits.",
    rewardWallet
      ? `You have ${rewardWallet.points || rewardWallet.balance || 0} reward points available.`
      : "Start shopping to activate reward points.",
  ];

  return (
    <SaqsoCard>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          Enterprise Activity Timeline
        </p>

        <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
          Recent Customer Journey
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Orders, saved looks, virtual try-ons, rewards and membership signals in one timeline.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-6 text-center dark:border-zinc-800">
              <p className="font-bold text-zinc-950 dark:text-white">
                No recent activity yet
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Your fashion journey will appear here.
              </p>
            </div>
          ) : (
            events.map((item, index) => (
              <div
                key={`${item.type}-${index}`}
                className="flex gap-4 rounded-3xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-xs font-black text-white dark:bg-white dark:text-black">
                  {index + 1}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                    {item.type}
                  </p>

                  <h3 className="mt-1 font-black text-zinc-950 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {item.subtitle}
                  </p>

                  <p className="mt-2 text-xs text-zinc-400">
                    {new Date(item.time).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-3xl bg-black p-6 text-white dark:bg-white dark:text-black">
          <p className="text-xs uppercase tracking-[0.3em] opacity-60">
            AI Fashion Insights
          </p>

          <h3 className="mt-3 text-2xl font-black">
            Smart Summary
          </h3>

          <div className="mt-5 space-y-3">
            {insights.map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-white/10 p-4 text-sm dark:bg-black/10"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SaqsoCard>
  );
}

