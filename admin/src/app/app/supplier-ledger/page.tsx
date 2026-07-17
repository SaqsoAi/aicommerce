"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getSupplierLedger } from "@/services/purchase.service";

export default function SupplierLedgerPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    getSupplierLedger().then((res) => {
      setRows(res.data || []);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
            Supplier Finance
          </p>
          <h1 className="mt-2 text-4xl font-black">Supplier Ledger</h1>
        </div>

        <div className="overflow-x-auto rounded-3xl border bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left">Supplier</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Reference</th>
                <th className="p-4 text-left">Notes</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t dark:border-zinc-800">
                  <td className="p-4 font-bold">{row.supplier?.name}</td>
                  <td className="p-4">{row.type}</td>
                  <td className="p-4">
                    Tk {Number(row.amount || 0).toLocaleString()}
                  </td>
                  <td className="p-4">{row.referenceId || "-"}</td>
                  <td className="p-4">{row.notes || "-"}</td>
                  <td className="p-4">
                    {new Date(row.createdAt).toLocaleString()}
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
