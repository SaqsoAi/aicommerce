"use client";

import { useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

import {
  transferStock,
  type StockTransferPayload,
} from "@/services/stock-transfer.service";

export default function StockTransferPage() {
  const [form, setForm] =
    useState<StockTransferPayload>({
      variantId: "",
      quantity: 1,
      fromWarehouseLocation: "",
      toWarehouseLocation: "",
      reason: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<any>(null);

  const [error, setError] =
    useState("");

  const updateField = (
    key: keyof StockTransferPayload,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    if (!form.variantId.trim()) {
      setError("Variant ID is required");
      return;
    }

    if (!form.toWarehouseLocation.trim()) {
      setError("Destination warehouse location is required");
      return;
    }

    if (Number(form.quantity) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      const response =
        await transferStock({
          ...form,
          quantity: Number(form.quantity),
          fromWarehouseLocation:
            form.fromWarehouseLocation || undefined,
          reason:
            form.reason || "Manual stock transfer",
        });

      setResult(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Stock transfer failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Inventory
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Stock Transfer
          </h1>

          <p className="mt-2 text-zinc-500">
            Transfer product variant stock between warehouse locations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-bold">
              Manual Stock Transfer
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Use this tool to move stock from one warehouse location to another.
            </p>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  Variant ID
                </span>

                <input
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900"
                  value={form.variantId}
                  onChange={(event) =>
                    updateField("variantId", event.target.value)
                  }
                  placeholder="Paste ProductVariant ID"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  Quantity
                </span>

                <input
                  type="number"
                  min={1}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900"
                  value={form.quantity}
                  onChange={(event) =>
                    updateField("quantity", Number(event.target.value))
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  From Warehouse Location
                </span>

                <input
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900"
                  value={form.fromWarehouseLocation}
                  onChange={(event) =>
                    updateField("fromWarehouseLocation", event.target.value)
                  }
                  placeholder="Main Warehouse / Rack A1"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  To Warehouse Location
                </span>

                <input
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900"
                  value={form.toWarehouseLocation}
                  onChange={(event) =>
                    updateField("toWarehouseLocation", event.target.value)
                  }
                  placeholder="Outlet / Rack B2"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  Reason
                </span>

                <textarea
                  className="min-h-[110px] rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900"
                  value={form.reason}
                  onChange={(event) =>
                    updateField("reason", event.target.value)
                  }
                  placeholder="Example: Transfer to Mirpur outlet"
                />
              </label>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900"
              >
                {loading ? "Transferring..." : "Transfer Stock"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-bold">
              Transfer Result
            </h2>

            {!result ? (
              <p className="mt-4 text-sm text-zinc-500">
                Transfer result will appear here after submission.
              </p>
            ) : (
              <div className="mt-5 space-y-3 text-sm">
                <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
                  <p>
                    <strong>Product:</strong>{" "}
                    {result.transfer?.productName || "N/A"}
                  </p>

                  <p>
                    <strong>SKU:</strong>{" "}
                    {result.transfer?.sku || "N/A"}
                  </p>

                  <p>
                    <strong>Quantity:</strong>{" "}
                    {result.transfer?.quantity}
                  </p>

                  <p>
                    <strong>From:</strong>{" "}
                    {result.transfer?.fromWarehouseLocation}
                  </p>

                  <p>
                    <strong>To:</strong>{" "}
                    {result.transfer?.toWarehouseLocation}
                  </p>

                  <p>
                    <strong>Reason:</strong>{" "}
                    {result.transfer?.reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
