"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getReturns,
  updateReturn,
} from "@/services/order-engine.service";

const returnStatuses = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PICKED_UP",
  "RECEIVED",
  "COMPLETED",
];

export default function ReturnsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const res = await getReturns();
      setItems(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (
    id: string,
    status: string
  ) => {
    await updateReturn(id, {
      status,
    });

    await load();
  };

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-[1500px] p-6">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Sales
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Returns
          </h1>

          <p className="mt-2 text-zinc-500">
            Manage return requests, pickup flow, receiving and completion.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b p-5 dark:border-zinc-800">
            <h2 className="text-xl font-black">
              Return Requests
            </h2>

            <button
              onClick={load}
              className="rounded-xl bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-500">
              Loading returns...
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No return requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-zinc-100 dark:bg-zinc-900">
                  <tr>
                    <th className="p-4 text-left">
                      Order
                    </th>

                    <th className="p-4 text-left">
                      Customer
                    </th>

                    <th className="p-4 text-left">
                      Reason
                    </th>

                    <th className="p-4 text-left">
                      Current Status
                    </th>

                    <th className="p-4 text-left">
                      Update Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t dark:border-zinc-800"
                    >
                      <td className="p-4">
                        {item.orderId}
                      </td>

                      <td className="p-4">
                        {item.userId || "N/A"}
                      </td>

                      <td className="p-4">
                        {item.reason || "N/A"}
                      </td>

                      <td className="p-4 font-bold">
                        {item.status}
                      </td>

                      <td className="p-4">
                        <select
                          value={item.status || "PENDING"}
                          onChange={async (event) => {
                            await changeStatus(
                              item.id,
                              event.target.value
                            );
                          }}
                          className="rounded-xl border p-2 dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          {returnStatuses.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
