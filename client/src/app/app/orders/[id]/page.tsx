"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getOrderById,
  getOrderTimeline,
  getOrderTracking,
} from "@/services/order.service";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type TimelineItem = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
};

export default function OrderDetailsPage({ params }: Props) {
  const [id, setId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((value) => {
      setId(value.id);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;

    Promise.all([getOrderById(id), getOrderTimeline(id), getOrderTracking(id)])
      .then(([orderRes, timelineRes, trackingRes]) => {
        setOrder(orderRes.data);
        setTimeline(timelineRes.data || []);
        setTracking(trackingRes.data || null);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-10 text-center dark:bg-black dark:text-white">
        Loading order...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-zinc-50 p-10 text-center dark:bg-black dark:text-white">
        Order not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/orders"
          className="inline-flex rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold dark:border-zinc-700"
        >
          ← Back to Orders
        </Link>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Order Details
          </p>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black">{order.orderNumber}</h1>

              <p className="mt-2 text-zinc-500">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-3xl font-black">Tk {order.finalAmount}</p>

              <p className="text-sm text-zinc-500">
                {order.paymentMethod} · {order.paymentStatus}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-5 text-2xl font-bold">Ordered Items</h2>

            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div>
                    <p className="font-semibold">
                      {item.product?.name || "Product"}
                    </p>

                    <p className="text-sm text-zinc-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold">Tk {item.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-5 text-2xl font-bold">Shipping</h2>

              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  <strong>Name:</strong> {order.customerName}
                </p>

                <p>
                  <strong>Phone:</strong> {order.customerPhone}
                </p>

                <p>
                  <strong>Address:</strong> {order.customerAddress}
                </p>

                <p>
                  <strong>Status:</strong> {order.status}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-5 text-2xl font-bold">Actions</h2>

              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black">
                  Download Invoice
                </button>

                <button className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold dark:border-zinc-700">
                  Track Order
                </button>

                <button className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold dark:border-zinc-700">
                  Request Return
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-5 text-2xl font-bold">Shipment Tracking</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-zinc-500">Courier</p>
              <p className="font-bold">{tracking?.courier || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">Tracking Code</p>
              <p className="font-bold">{tracking?.trackingCode || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">Shipment Status</p>
              <p className="font-bold">
                {tracking?.shipmentStatus || "PENDING"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-5 text-2xl font-bold">Order Timeline</h2>

          {timeline.length === 0 ? (
            <p className="text-zinc-500">No timeline yet.</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold dark:bg-zinc-900">
                      {item.status}
                    </span>

                    <span className="text-xs text-zinc-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
