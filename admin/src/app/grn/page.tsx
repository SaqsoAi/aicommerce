"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getGrnList } from "@/services/purchase.service";

export default function GrnPage() {
  const [grns, setGrns] = useState<any[]>([]);

  useEffect(() => {
    getGrnList().then((res) => {
      setGrns(res.data || []);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
            Goods Receive Notes
          </p>
          <h1 className="mt-2 text-4xl font-black">GRN</h1>
        </div>

        <div className="overflow-x-auto rounded-3xl border bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left">GRN No</th>
                <th className="p-4 text-left">PO No</th>
                <th className="p-4 text-left">Supplier</th>
                <th className="p-4 text-left">Qty</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {grns.map((grn) => (
                <tr key={grn.id} className="border-t dark:border-zinc-800">
                  <td className="p-4 font-bold">{grn.grnNumber}</td>
                  <td className="p-4">{grn.purchaseOrder?.orderNumber}</td>
                  <td className="p-4">
                    {grn.purchaseOrder?.supplier?.name || "-"}
                  </td>
                  <td className="p-4">{grn.totalQty}</td>
                  <td className="p-4">
                    Tk {Number(grn.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {new Date(grn.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
