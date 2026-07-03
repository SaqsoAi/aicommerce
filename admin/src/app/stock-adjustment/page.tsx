"use client";

import { useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

import {
  adjustStock,
  type StockAdjustmentPayload,
} from "@/services/stock-adjustment.service";

export default function StockAdjustmentPage() {
  const [form, setForm] = useState<StockAdjustmentPayload>({
    variantId: "",
    type: "INCREASE",
    quantity: 0,
    reason: "",
    warehouseLocation: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const updateField = (
    key: keyof StockAdjustmentPayload,
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

    if (Number(form.quantity) < 0) {
      setError("Quantity cannot be negative");
      return;
    }

    try {
      setLoading(true);

      const response = await adjustStock({
        ...form,
        quantity: Number(form.quantity),
        reason: form.reason || "Manual stock adjustment",
        warehouseLocation: form.warehouseLocation || undefined,
      });

      setResult(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Stock adjustment failed"
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
            Stock Adjustment
          </h1>
          <p className="mt-2 text-zinc-500">
            Adjust product variant stock safely with inventory permissions.
          </p>
        </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-bold">
            Manual Stock Adjustment
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Use this tool for stock correction, damaged stock, manual receiving or audit correction.
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
                Adjustment Type
              </span>

              <select
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900"
                value={form.type}
                onChange={(event) =>
                  updateField(
                    "type",
                    event.target.value as StockAdjustmentPayload["type"]
                  )
                }
              >
                <option value="INCREASE">
                  Increase Stock
                </option>
                <option value="DECREASE">
                  Decrease Stock
                </option>
                <option value="SET">
                  Set Exact Stock
                </option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">
                Quantity
              </span>

              <input
                type="number"
                min={0}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900"
                value={form.quantity}
                onChange={(event) =>
                  updateField("quantity", Number(event.target.value))
                }
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">
                Warehouse Location
              </span>

              <input
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900"
                value={form.warehouseLocation}
                onChange={(event) =>
                  updateField("warehouseLocation", event.target.value)
                }
                placeholder="Main Warehouse / Rack A1"
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
                placeholder="Example: Stock correction after physical count"
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
              {loading ? "Adjusting..." : "Adjust Stock"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-bold">
            Result
          </h2>

          {!result ? (
            <p className="mt-4 text-sm text-zinc-500">
              Adjustment result will appear here after submission.
            </p>
          ) : (
            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
                <p>
                  <strong>Product:</strong>{" "}
                  {result.adjustment?.productName || "N/A"}
                </p>
                <p>
                  <strong>SKU:</strong>{" "}
                  {result.adjustment?.sku || "N/A"}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  {result.adjustment?.type}
                </p>
                <p>
                  <strong>Previous Stock:</strong>{" "}
                  {result.adjustment?.previousStock}
                </p>
                <p>
                  <strong>New Stock:</strong>{" "}
                  {result.adjustment?.nextStock}
                </p>
                <p>
                  <strong>Reason:</strong>{" "}
                  {result.adjustment?.reason}
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

