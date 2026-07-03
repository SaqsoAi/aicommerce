"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CustomerAutomationTimelineItem,
  getCustomerAutomationTimeline,
} from "@/services/customerAutomation.service";

export default function CommunicationCenterPage() {
  const [items, setItems] = useState<CustomerAutomationTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    return {
      order: items.filter((i) => i.type === "ORDER").length,
      membership: items.filter((i) => i.type === "MEMBERSHIP").length,
      reward: items.filter((i) => i.type === "REWARD").length,
      cart: items.filter((i) => i.type === "CART").length,
    };
  }, [items]);

  const load = async () => {
    setLoading(true);
    const data = await getCustomerAutomationTimeline();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
            Communication Center
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Customer Automation Timeline
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-300">
            Track your order, cart recovery, membership, reward, SMS, WhatsApp
            and in-app automation updates from one place.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Stat title="Order Updates" value={stats.order} />
          <Stat title="Membership" value={stats.membership} />
          <Stat title="Rewards" value={stats.reward} />
          <Stat title="Cart Recovery" value={stats.cart} />
        </section>

        <section className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
          <h2 className="text-lg font-bold text-amber-100">
            Cart Recovery Visibility
          </h2>
          <p className="mt-1 text-sm text-amber-50/80">
            If you leave items in your cart, reminder messages and recovery
            offers will appear in this timeline.
          </p>
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              Loading communication history...
            </div>
          ) : (
            items.map((item) => <TimelineCard key={item.id} item={item} />)
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-neutral-400">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function TimelineCard({ item }: { item: CustomerAutomationTimelineItem }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              {item.type}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-200">
              {item.channel || "IN_APP"}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-200">
              {item.status}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-bold">{item.title}</h2>
          <p className="mt-1 text-sm text-neutral-300">{item.description}</p>
        </div>

        <time className="text-xs text-neutral-500">
          {new Date(item.createdAt).toLocaleString()}
        </time>
      </div>
    </article>
  );
}