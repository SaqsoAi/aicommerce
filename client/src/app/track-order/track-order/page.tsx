"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [tracking, setTracking] = useState<any>(null);

  const search = () => {
    if (!orderNumber.trim()) return;

    setTracking({
      orderNumber,
      status: "PROCESSING",
      courier: "SAQSO Delivery Partner",
      trackingCode: `SQ-${orderNumber}`,
      promise: "Estimated delivery within 2-5 business days",
      currentStep: 2,
    });
  };

  return (
    <main className="min-min-min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <section className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2.5rem] bg-black p-8 text-white dark:bg-white dark:text-black">
          <p className="text-xs uppercase tracking-[0.4em] opacity-60">
            Luxury Order Tracking
          </p>

          <h1 className="mt-4 max-w-3xl text-2xl sm:text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl lg:text-2xl sm:text-xl sm:text-2xl lg:text-3xl lg:text-4xl font-black md:text-6xl">
            Track your SAQSO order journey.
          </h1>

          <p className="mt-4 max-w-2xl text-sm opacity-70 md:text-base">
            Follow your order from confirmation to delivery with membership priority and reward visibility.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
              Track Order
            </p>

            <h2 className="mt-3 text-2xl font-black text-zinc-950 dark:text-white">
              Enter your order number
            </h2>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="Example: ORD-1001"
                className="flex-1 rounded-2xl border px-5 py-4 outline-none dark:border-zinc-800 dark:bg-black dark:text-white"
              />

              <button
                onClick={search}
                className="rounded-2xl bg-black px-6 py-4 font-bold text-white dark:bg-white dark:text-black"
              >
                Track Now
              </button>
            </div>

            {tracking ? (
              <div className="mt-8 space-y-6">
                <div className="rounded-3xl bg-zinc-50 p-5 dark:bg-zinc-900">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-zinc-500">
                        Order Number
                      </p>

                      <h3 className="mt-1 text-xl font-black text-zinc-950 dark:text-white">
                        {tracking.orderNumber}
                      </h3>
                    </div>

                    <span className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-black">
                      {tracking.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const active = index <= tracking.currentStep;

                    return (
                      <div
                        key={step}
                        className="flex items-center gap-4"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                            active
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div>
                          <p className="font-bold text-zinc-950 dark:text-white">
                            {step}
                          </p>

                          <p className="text-sm text-zinc-500">
                            {active ? "Completed / Active" : "Pending"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-dashed p-8 text-center dark:border-zinc-800">
                <p className="font-bold text-zinc-950 dark:text-white">
                  No tracking selected
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Enter your order number to view the luxury tracking timeline.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-black p-6 text-white dark:bg-white dark:text-black">
              <p className="text-xs uppercase tracking-[0.35em] opacity-60">
                Delivery Promise
              </p>

              <h2 className="mt-3 text-2xl font-black">
                Priority handling for loyal customers.
              </h2>

              <p className="mt-3 text-sm opacity-70">
                Membership customers receive faster support, better tracking visibility and smoother post-purchase service.
              </p>
            </div>

            <div className="rounded-[2rem] border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="text-xl font-black text-zinc-950 dark:text-white">
                Rewards after delivery
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Reward points are calculated after your order is completed according to active reward rules.
              </p>

              <Link
                href="/dashboard"
                className="mt-5 inline-flex rounded-full bg-black px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black"
              >
                View Dashboard
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}


