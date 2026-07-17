"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getOrders,
  getReturns,
  getRefunds,
} from "@/services/order-engine.service";

type SavedLookAnalytics = {
  totalSavedLooks: number;
  totalUniqueLookbooks: number;
  topSavedLookbooks: any[];
  recentSavedLooks: any[];
};

type TryOnAnalytics = {
  totalTryOns: number;
  completedTryOns: number;
  failedTryOns: number;
  processingTryOns: number;
  topTriedProducts: any[];
  recentTryOns: any[];
};

const defaultSavedLookAnalytics: SavedLookAnalytics = {
  totalSavedLooks: 0,
  totalUniqueLookbooks: 0,
  topSavedLookbooks: [],
  recentSavedLooks: [],
};

const defaultTryOnAnalytics: TryOnAnalytics = {
  totalTryOns: 0,
  completedTryOns: 0,
  failedTryOns: 0,
  processingTryOns: 0,
  topTriedProducts: [],
  recentTryOns: [],
};

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [savedLooks, setSavedLooks] = useState<SavedLookAnalytics>(defaultSavedLookAnalytics);
  const [tryOn, setTryOn] = useState<TryOnAnalytics>(defaultTryOnAnalytics);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const load = async () => {
    setLoading(true);

    try {
      const [orderRes, returnRes, refundRes] = await Promise.all([
        getOrders(),
        getReturns(),
        getRefunds(),
      ]);

      setOrders(orderRes.data || []);
      setReturns(returnRes.data || []);
      setRefunds(refundRes.data || []);

      try {
        const savedLooksRes = await fetch(`${apiBase}/analytics/saved-looks`);
        const savedLooksJson = await savedLooksRes.json();
        setSavedLooks(savedLooksJson.data || defaultSavedLookAnalytics);
      } catch (error) {
        console.error("Saved Looks analytics load failed", error);
      }

      try {
        const tryOnRes = await fetch(`${apiBase}/analytics/virtual-tryon`);
        const tryOnJson = await tryOnRes.json();
        setTryOn(tryOnJson.data || defaultTryOnAnalytics);
      } catch (error) {
        console.error("Virtual Try-On analytics load failed", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.finalAmount || 0),
    0
  );

  const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length;
  const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
  const completedReturns = returns.filter((item) => item.status === "COMPLETED").length;

  const refundedTotal = refunds
    .filter((item) => item.status === "REFUNDED" || item.status === "COMPLETED")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const salesCards = [
    { label: "Total Orders", value: orders.length },
    { label: "Pending Orders", value: pendingOrders },
    { label: "Delivered Orders", value: deliveredOrders },
    { label: "Total Revenue", value: `Tk ${totalRevenue}` },
    { label: "Return Requests", value: returns.length },
    { label: "Completed Returns", value: completedReturns },
    { label: "Refund Requests", value: refunds.length },
    { label: "Refunded Amount", value: `Tk ${refundedTotal}` },
  ];

  const savedLookCards = [
    { label: "Total Saved Looks", value: savedLooks.totalSavedLooks },
    { label: "Unique Lookbooks Saved", value: savedLooks.totalUniqueLookbooks },
    { label: "Top Lookbooks", value: savedLooks.topSavedLookbooks.length },
    { label: "Recent Saved Activity", value: savedLooks.recentSavedLooks.length },
  ];

  const tryOnCards = [
    { label: "Total Try-Ons", value: tryOn.totalTryOns },
    { label: "Completed Try-Ons", value: tryOn.completedTryOns },
    { label: "Failed Try-Ons", value: tryOn.failedTryOns },
    { label: "Processing Try-Ons", value: tryOn.processingTryOns },
  ];

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-[1500px] p-6">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Analytics
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Enterprise Analytics
          </h1>

          <p className="mt-2 text-zinc-500">
            Sales, saved looks and virtual try-on intelligence overview.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border bg-white p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
            Loading analytics...
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="mb-4 text-2xl font-black">Sales Overview</h2>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {salesCards.map((card) => (
                  <div key={card.label} className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-sm text-zinc-500">{card.label}</p>
                    <h2 className="mt-3 text-3xl font-black">{card.value}</h2>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Lookbook Intelligence
              </p>
              <h2 className="mt-2 text-2xl font-black">Saved Looks Analytics</h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {savedLookCards.map((card) => (
                  <div key={card.label} className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-sm text-zinc-500">{card.label}</p>
                    <h2 className="mt-3 text-3xl font-black">{card.value}</h2>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="text-xl font-black">Top Saved Lookbooks</h3>
                  <div className="mt-5 space-y-4">
                    {savedLooks.topSavedLookbooks.length === 0 ? (
                      <p className="text-sm text-zinc-500">No saved lookbook data yet.</p>
                    ) : (
                      savedLooks.topSavedLookbooks.map((item, index) => (
                        <div key={item.lookbook?.id || index} className="flex items-center justify-between gap-4 rounded-2xl border p-4 dark:border-zinc-800">
                          <div>
                            <p className="font-bold">{item.lookbook?.title || "Deleted Lookbook"}</p>
                            <p className="text-sm text-zinc-500">/{item.lookbook?.slug || "missing"}</p>
                          </div>
                          <span className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-black">
                            {item.savedCount} saves
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="text-xl font-black">Recent Saved Activity</h3>
                  <div className="mt-5 space-y-4">
                    {savedLooks.recentSavedLooks.length === 0 ? (
                      <p className="text-sm text-zinc-500">No recent saved looks yet.</p>
                    ) : (
                      savedLooks.recentSavedLooks.slice(0, 10).map((item) => (
                        <div key={item.id} className="rounded-2xl border p-4 dark:border-zinc-800">
                          <p className="font-bold">{item.lookbook?.title || "Lookbook"}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Saved by {item.user?.name || item.user?.email || "Customer"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                AI Try-On Intelligence
              </p>
              <h2 className="mt-2 text-2xl font-black">Virtual Try-On Analytics</h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {tryOnCards.map((card) => (
                  <div key={card.label} className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-sm text-zinc-500">{card.label}</p>
                    <h2 className="mt-3 text-3xl font-black">{card.value}</h2>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="text-xl font-black">Top Tried Products</h3>

                  <div className="mt-5 space-y-4">
                    {tryOn.topTriedProducts.length === 0 ? (
                      <p className="text-sm text-zinc-500">No try-on product data yet.</p>
                    ) : (
                      tryOn.topTriedProducts.map((item, index) => (
                        <div key={item.product?.id || index} className="flex items-center justify-between gap-4 rounded-2xl border p-4 dark:border-zinc-800">
                          <div>
                            <p className="font-bold">{item.product?.name || "Product"}</p>
                            <p className="text-sm text-zinc-500">Tk {item.product?.price || 0}</p>
                          </div>

                          <span className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-black">
                            {item.tryOnCount} tries
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="text-xl font-black">Recent Try-On Activity</h3>

                  <div className="mt-5 space-y-4">
                    {tryOn.recentTryOns.length === 0 ? (
                      <p className="text-sm text-zinc-500">No recent try-ons yet.</p>
                    ) : (
                      tryOn.recentTryOns.slice(0, 10).map((item) => (
                        <div key={item.id} className="rounded-2xl border p-4 dark:border-zinc-800">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-bold">{item.product?.name || "Product"}</p>
                              <p className="mt-1 text-sm text-zinc-500">
                                {item.user?.name || item.user?.email || "Customer"}
                              </p>
                            </div>

                            <span className="rounded-full border px-3 py-1 text-xs font-bold dark:border-zinc-700">
                              {item.status}
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-zinc-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
