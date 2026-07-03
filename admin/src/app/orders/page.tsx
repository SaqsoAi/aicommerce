"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getOrders,
  updateOrderStatus,
  generateInvoice,
  getInvoice,
  getOrderTimeline,
} from "@/services/order-engine.service";

const statuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineOrderId, setTimelineOrderId] = useState<string | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders();
      setOrders(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openTimeline = async (orderId: string) => {
    try {
      const res = await getOrderTimeline(orderId);

      setTimeline(res.data || []);
      setTimelineOrderId(orderId);
      setTimelineOpen(true);
    } catch (error) {
      console.error(error);
      alert("Failed to load timeline");
    }
  };

  const openInvoice = async (orderId: string) => {
    try {
      const generated = await generateInvoice(orderId);
      const res = await getInvoice(orderId);

      setInvoice(res.data || generated.data || null);
      setInvoiceOpen(true);
    } catch (error) {
      console.error(error);
      alert("Failed to load invoice");
    }
  };

  const totalRevenue =
    orders.reduce((sum, order) => sum + Number(order.finalAmount || 0), 0);

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Order Engine
          </p>
          <h1 className="mt-2 text-4xl font-black text-zinc-950 dark:text-white">
            Orders Dashboard
          </h1>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500">Total Orders</p>
            <h2 className="mt-2 text-3xl font-black">{orders.length}</h2>
          </div>
          <div className="rounded-3xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500">Pending</p>
            <h2 className="mt-2 text-3xl font-black">
              {orders.filter((o) => o.status === "PENDING").length}
            </h2>
          </div>
          <div className="rounded-3xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500">Delivered</p>
            <h2 className="mt-2 text-3xl font-black">
              {orders.filter((o) => o.status === "DELIVERED").length}
            </h2>
          </div>
          <div className="rounded-3xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500">Revenue</p>
            <h2 className="mt-2 text-3xl font-black">Tk {totalRevenue}</h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b p-5 dark:border-zinc-800">
            <h2 className="text-xl font-black">Order List</h2>
            <button
              onClick={loadOrders}
              className="rounded-xl bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-zinc-100 dark:bg-zinc-900">
                  <tr>
                    <th className="p-4 text-left">Order</th>
                    <th className="p-4 text-left">Customer</th>
                    <th className="p-4 text-left">Phone</th>
                    <th className="p-4 text-left">Amount</th>
                    <th className="p-4 text-left">Payment</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t dark:border-zinc-800">
                      <td className="p-4 font-bold">{order.orderNumber || order.id}</td>
                      <td className="p-4">{order.customerName}</td>
                      <td className="p-4">{order.customerPhone}</td>
                      <td className="p-4 font-bold">Tk {order.finalAmount}</td>
                      <td className="p-4">{order.paymentStatus}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={async (e) => {
                            await updateOrderStatus(order.id, e.target.value);
                            await loadOrders();
                          }}
                          className="rounded-xl border p-2 dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openTimeline(order.id)}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-white"
                          >
                            Timeline
                          </button>

                          <button
                            onClick={() => openInvoice(order.id)}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
                          >
                            Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {invoiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="absolute right-0 top-0 h-full w-[500px] overflow-y-auto bg-white p-6 dark:bg-zinc-950">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  Invoice
                </h2>
                <p className="text-sm text-zinc-500">
                  Order invoice summary
                </p>
              </div>

              <button
                onClick={() => setInvoiceOpen(false)}
                className="rounded-xl border px-3 py-2"
              >
                Close
              </button>
            </div>

            {!invoice ? (
              <p className="text-zinc-500">No invoice found.</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border p-4 dark:border-zinc-800">
                  <p className="text-sm text-zinc-500">Invoice Number</p>
                  <p className="text-xl font-black">
                    {invoice.invoiceNumber || invoice.id || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border p-4 dark:border-zinc-800">
                  <div className="flex justify-between py-2">
                    <span>Subtotal</span>
                    <strong>Tk {invoice.subtotal || 0}</strong>
                  </div>

                  <div className="flex justify-between py-2">
                    <span>Discount</span>
                    <strong>Tk {invoice.discount || 0}</strong>
                  </div>

                  <div className="flex justify-between py-2">
                    <span>Delivery Charge</span>
                    <strong>Tk {invoice.deliveryCharge || 0}</strong>
                  </div>

                  <div className="mt-3 flex justify-between border-t pt-3 text-lg">
                    <span className="font-black">Total</span>
                    <strong>Tk {invoice.total || 0}</strong>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-bold text-white dark:bg-white dark:text-zinc-900"
                >
                  Print Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {timelineOpen && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="absolute right-0 top-0 h-full w-[500px] overflow-y-auto bg-white p-6 dark:bg-zinc-950">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  Timeline
                </h2>
                <p className="text-sm text-zinc-500">
                  Order: {timelineOrderId}
                </p>
              </div>

              <button
                onClick={() => setTimelineOpen(false)}
                className="rounded-xl border px-3 py-2"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {timeline.length === 0 ? (
                <p className="text-zinc-500">No timeline events.</p>
              ) : (
                timeline.map((event, index) => (
                  <div
                    key={event.id || index}
                    className="rounded-2xl border p-4 dark:border-zinc-800"
                  >
                    <p className="font-bold">
                      {event.status}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {event.message}
                    </p>

                    <p className="mt-2 text-xs text-zinc-400">
                      {event.createdAt
                        ? new Date(event.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

