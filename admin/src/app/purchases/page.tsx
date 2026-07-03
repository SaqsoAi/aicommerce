"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getPurchaseOrders,
  receivePurchaseOrder,
} from "@/services/purchase.service";

export default function PurchasesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getPurchaseOrders();
      setOrders(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const receive = async (id: string) => {
    if (!confirm("Receive this purchase order?")) return;

    const res = await receivePurchaseOrder(id, {});

    if (!res.success) {
      alert(res.message || "Receive failed");
      return;
    }

    alert("Purchase received and inventory updated");
    await loadData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
            Purchase Engine
          </p>
          <h1 className="mt-2 text-4xl font-black">Purchases</h1>
          <p className="mt-2 text-zinc-500">
            Purchase orders, receive stock, GRN and barcode-ready inventory.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border p-5 dark:border-zinc-800">
            <p className="text-xs font-black uppercase text-zinc-500">
              Total Orders
            </p>
            <p className="mt-3 text-3xl font-black">{orders.length}</p>
          </div>

          <div className="rounded-3xl border p-5 dark:border-zinc-800">
            <p className="text-xs font-black uppercase text-zinc-500">
              Pending
            </p>
            <p className="mt-3 text-3xl font-black">
              {orders.filter((x) => x.status !== "RECEIVED").length}
            </p>
          </div>

          <div className="rounded-3xl border p-5 dark:border-zinc-800">
            <p className="text-xs font-black uppercase text-zinc-500">
              Received
            </p>
            <p className="mt-3 text-3xl font-black">
              {orders.filter((x) => x.status === "RECEIVED").length}
            </p>
          </div>

          <div className="rounded-3xl border p-5 dark:border-zinc-800">
            <p className="text-xs font-black uppercase text-zinc-500">
              Total Amount
            </p>
            <p className="mt-3 text-2xl font-black">
              Tk{" "}
              {orders
                .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
                .toLocaleString()}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left">PO No</th>
                <th className="p-4 text-left">Supplier</th>
                <th className="p-4 text-left">Items</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t dark:border-zinc-800">
                  <td className="p-4 font-bold">{order.orderNumber}</td>
                  <td className="p-4">{order.supplier?.name || "-"}</td>
                  <td className="p-4">{order.items?.length || 0}</td>
                  <td className="p-4">
                    Tk {Number(order.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black dark:bg-zinc-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => receive(order.id)}
                      disabled={order.status === "RECEIVED"}
                      className="rounded-xl bg-black px-4 py-2 text-xs font-black text-white disabled:opacity-40 dark:bg-white dark:text-black"
                    >
                      Receive
                    </button>
                  </td>
                </tr>
              ))}

              {!orders.length && !loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No purchase orders found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
