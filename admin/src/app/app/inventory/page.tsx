"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getInventory,
  getInventoryStats,
  getLowStock,
  getOutOfStock,
  getInventoryHistory,
  getReconciliation,
} from "@/services/inventory.service";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [outOfStock, setOutOfStock] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [reconciliation, setReconciliation] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  const [forecast, setForecast] = useState<any>({
    lowStockRisk: 0,
    outOfStockRisk: 0,
    reorderSuggestion: 0,
    next30DayDemand: 0,
    trend: "N/A",
    confidence: 0,
    volatility: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        inventoryRes,
        statsRes,
        lowRes,
        outRes,
        historyRes,
        reconciliationRes,
      ] = await Promise.all([
        getInventory(),
        getInventoryStats(),
        getLowStock(),
        getOutOfStock(),
        getInventoryHistory(),
        getReconciliation(),
      ]);

      setInventory(inventoryRes.data || []);
      setStats(statsRes.data || {});
      setLowStock(lowRes.data || []);
      setOutOfStock(outRes.data || []);
      setHistory(historyRes.data || []);
      setReconciliation(reconciliationRes.data || []);

      try {
        const forecastRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/inventory-dashboard/forecast`
        );

        const forecastJson = await forecastRes.json();

        setForecast(
          forecastJson.data || {
            lowStockRisk: 0,
            outOfStockRisk: 0,
            reorderSuggestion: 0,
            next30DayDemand: 0,
            trend: "N/A",
            confidence: 0,
            volatility: 0,
          }
        );
      } catch (error) {
        console.error("Inventory forecast load failed", error);
      }
    } catch (error) {
      console.error(error);
      alert("Inventory dashboard load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const chartData = useMemo(() => {
    return reconciliation.slice(0, 12).map((item) => ({
      name: item.productName,
      qty: item.currentQty,
      value: item.saleValue,
    }));
  }, [reconciliation]);

  const cards = [
    ["Total Variants", stats.totalVariants || inventory.length],
    ["Current Stock", stats.totalQty || 0],
    ["Low Stock", stats.lowStock || lowStock.length],
    ["Out Of Stock", stats.outOfStock || outOfStock.length],
    ["Cost Value", `Tk ${Number(stats.totalCostValue || 0).toLocaleString()}`],
    ["Sale Value", `Tk ${Number(stats.totalSaleValue || 0).toLocaleString()}`],
    ["Profit Potential", `Tk ${Number(stats.potentialProfit || 0).toLocaleString()}`],

    ["Low Stock Risk", `${forecast.lowStockRisk}%`],
    ["Out Of Stock Risk", `${forecast.outOfStockRisk}%`],
    ["30 Day Demand", forecast.next30DayDemand],
    ["Reorder Suggestion", forecast.reorderSuggestion],
    ["Trend", forecast.trend],
    ["Confidence", `${forecast.confidence}%`],
    ["Volatility", forecast.volatility],
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
              Inventory Analytics
            </p>
            <h1 className="mt-2 text-4xl font-black">
              Inventory Dashboard
            </h1>
            <p className="mt-2 text-zinc-500">
              Current stock, valuation, low stock, out of stock and reconciliation report.
            </p>
          </div>

          <button
            onClick={loadData}
            className="rounded-xl bg-black px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-black"
          >
            Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                {label}
              </p>
              <p className="mt-3 text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-5 text-2xl font-black">
            Stock Value Graph
          </h2>

          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qty" />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-xl font-black">Low Stock</h2>
            <div className="space-y-3">
              {lowStock.length ? (
                lowStock.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-yellow-50 p-4 text-sm dark:bg-yellow-900/20">
                    <b>{item.product?.name}</b> — {item.color}/{item.size} — Qty: {item.availableStock ?? item.stock}
                  </div>
                ))
              ) : (
                <p className="text-zinc-500">No low stock items.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-xl font-black">Out Of Stock</h2>
            <div className="space-y-3">
              {outOfStock.length ? (
                outOfStock.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-red-50 p-4 text-sm dark:bg-red-900/20">
                    <b>{item.product?.name}</b> — {item.color}/{item.size}
                  </div>
                ))
              ) : (
                <p className="text-zinc-500">No out of stock items.</p>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b p-5 dark:border-zinc-800">
            <h2 className="text-2xl font-black">Reconciliation Report</h2>
          </div>

          <table className="w-full min-w-[1200px] text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">SKU</th>
                <th className="p-4 text-left">Color</th>
                <th className="p-4 text-left">Size</th>
                <th className="p-4 text-left">Purchase</th>
                <th className="p-4 text-left">Sold</th>
                <th className="p-4 text-left">Return</th>
                <th className="p-4 text-left">Current</th>
                <th className="p-4 text-left">Cost Value</th>
                <th className="p-4 text-left">Sale Value</th>
              </tr>
            </thead>

            <tbody>
              {reconciliation.map((item) => (
                <tr key={item.id} className="border-t dark:border-zinc-800">
                  <td className="p-4 font-bold">{item.productName}</td>
                  <td className="p-4">{item.sku}</td>
                  <td className="p-4">{item.color}</td>
                  <td className="p-4">{item.size}</td>
                  <td className="p-4">{item.purchaseQty}</td>
                  <td className="p-4">{item.soldQty}</td>
                  <td className="p-4">{item.returnedQty}</td>
                  <td className="p-4">{item.currentQty}</td>
                  <td className="p-4">Tk {Number(item.costValue).toLocaleString()}</td>
                  <td className="p-4">Tk {Number(item.saleValue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b p-5 dark:border-zinc-800">
            <h2 className="text-2xl font-black">Inventory History</h2>
          </div>

          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">SKU</th>
                <th className="p-4 text-left">Barcode</th>
                <th className="p-4 text-left">Color</th>
                <th className="p-4 text-left">Size</th>
                <th className="p-4 text-left">Qty</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-t dark:border-zinc-800">
                  <td className="p-4 font-bold">{item.productName}</td>
                  <td className="p-4">{item.sku}</td>
                  <td className="p-4">{item.barcode}</td>
                  <td className="p-4">{item.color}</td>
                  <td className="p-4">{item.size}</td>
                  <td className="p-4">{item.currentQty}</td>
                  <td className="p-4">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="fixed bottom-4 right-4 rounded-xl bg-black px-4 py-3 text-white">
            Loading inventory...
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}



