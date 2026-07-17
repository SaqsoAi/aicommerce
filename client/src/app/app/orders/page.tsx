"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/providers/AuthProvider";
import { getMyOrders } from "@/services/order.service";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  finalAmount: number;
  paymentMethod?: string;
  createdAt: string;
  items?: any[];
};

const statusClass = (status: string) => {
  if (status === "DELIVERED") {
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  }

  if (status === "CANCELLED" || status === "RETURNED") {
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  }

  if (status === "SHIPPED" || status === "PROCESSING") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
  }

  if (status === "CONFIRMED") {
    return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
  }

  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
};

export default function OrdersPage() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    getMyOrders(user.id)
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return orders;

    return orders.filter((order) => {
      return (
        order.orderNumber?.toLowerCase().includes(keyword) ||
        order.status?.toLowerCase().includes(keyword) ||
        order.paymentStatus?.toLowerCase().includes(keyword)
      );
    });
  }, [orders, search]);

  return (
    <main className="min-min-min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900 dark:bg-white text-slate-950 dark:bg-black dark:text-white dark:text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Account
          </p>

          <h1 className="mt-3 text-2xl sm:text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl lg:text-2xl sm:text-xl sm:text-2xl lg:text-3xl lg:text-2xl sm:text-3xl lg:text-4xl font-black">My Orders</h1>

          <p className="mt-2 text-zinc-500">
            Track your orders, payments, invoices and shipping updates.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number, status or payment..."
            className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-8 lg:p-5 sm:p-8 lg:p-10 text-center dark:border-zinc-800 dark:bg-zinc-950">
            Loading orders...
          </div>
        ) : !user?.id ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-8 lg:p-5 sm:p-8 lg:p-10 text-center dark:border-zinc-800 dark:bg-zinc-950">
            Please login to view your orders.
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-8 lg:p-5 sm:p-8 lg:p-10 text-center dark:border-zinc-800 dark:bg-zinc-950">
            No orders found.
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black">
                        {order.orderNumber}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-zinc-500">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-2xl font-black">
                      Tk {order.finalAmount}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {order.paymentMethod || "Payment"} Â· {order.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-full bg-white text-slate-950 dark:bg-black dark:text-white px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
                  >
                    View Details
                  </Link>

                  <button className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold dark:border-zinc-700">
                    Invoice
                  </button>

                  <button className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold dark:border-zinc-700">
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}





