"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cart.store";
import {
  getMembershipCartRecommendation,
  getMembershipQualification,
} from "@/services/membership.service";

export default function SaqsoAIMembershipBanner() {
  const { items } = useCartStore();

  const [recommendation, setRecommendation] = useState<any>(null);
  const [qualification, setQualification] = useState<any>(null);

  const cartAmount = useMemo(() => {
    return items.reduce(
      (sum, item: any) =>
        sum +
        Number(item.price || 0) *
          Number(item.quantity || 1),
      0
    );
  }, [items]);

  useEffect(() => {
    if (!cartAmount) return;

    getMembershipCartRecommendation(cartAmount)
      .then((res) => setRecommendation(res.data))
      .catch(console.error);

    getMembershipQualification(cartAmount)
      .then((res) => setQualification(res.data))
      .catch(console.error);
  }, [cartAmount]);

  if (!cartAmount) {
    return null;
  }

  const qualified =
    qualification?.qualified;

  const message =
    qualified
      ? qualification?.message
      : recommendation?.message;

  if (!message) {
    return null;
  }

  if (!recommendation?.showBanner && !qualified) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div
        className="
          relative
          overflow-hidden
          rounded-[2rem]
          border
          border-amber-300/50
          bg-amber-50
          p-6
          shadow-xl
          dark:border-amber-500/30
          dark:bg-amber-950/30
          md:p-8
        "
      >
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-400/30 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">
              AI Membership Advisor
            </p>

            <h2 className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
              {message}
            </h2>

            {!qualified && recommendation?.needAmount && (
              <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                Add products worth Tk {recommendation.needAmount} more to unlock this card.
              </p>
            )}

            {qualified && (
              <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                You can claim your membership card from customer dashboard after completing your profile.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {qualified && (
              <Link
                href="/dashboard#account-settings"
                className="rounded-full bg-black px-6 py-3 font-bold text-white dark:bg-white dark:text-black"
              >
                Claim Card
              </Link>
            )}

            <Link
              href="/dashboard"
              className="rounded-full border border-zinc-300 px-6 py-3 font-bold text-zinc-900 dark:border-zinc-700 dark:text-white"
            >
              View Benefits
            </Link>

            <Link
              href="/shop"
              className="rounded-full bg-amber-400 px-6 py-3 font-bold text-black"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


