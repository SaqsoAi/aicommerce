"use client";

import { useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

import {
  assignCourier,
  createTracking,
} from "@/services/order-engine.service";

export default function CouriersPage() {
  const [form, setForm] = useState({
    orderId: "",
    courierName: "",
    courierPhone: "",
    courierEmail: "",
    trackingCode: "",
    trackingUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const updateField = (
    key: string,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const assignCourierOnly = async () => {
    setError("");
    setResult("");

    if (!form.orderId.trim()) {
      setError("Order ID is required");
      return;
    }

    if (!form.courierName.trim()) {
      setError("Courier name is required");
      return;
    }

    try {
      setLoading(true);

      await assignCourier(form.orderId, {
        courierName: form.courierName,
        courierPhone: form.courierPhone,
        courierEmail: form.courierEmail,
      });

      setResult("Courier assigned successfully");
    } catch (err: any) {
      setError(
        err?.message ||
          "Courier assignment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const createTrackingOnly = async () => {
    setError("");
    setResult("");

    if (!form.orderId.trim()) {
      setError("Order ID is required");
      return;
    }

    if (!form.trackingCode.trim()) {
      setError("Tracking code is required");
      return;
    }

    try {
      setLoading(true);

      await createTracking(form.orderId, {
        trackingCode: form.trackingCode,
        courierName: form.courierName,
        trackingUrl: form.trackingUrl,
      });

      setResult("Tracking created successfully");
    } catch (err: any) {
      setError(
        err?.message ||
          "Tracking creation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const assignAndTrack = async () => {
    await assignCourierOnly();

    if (form.trackingCode.trim()) {
      await createTrackingOnly();
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Sales
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Courier Management
          </h1>

          <p className="mt-2 text-zinc-500">
            Assign courier partners and create tracking information for orders.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-bold">
              Courier Assignment
            </h2>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  Order ID
                </span>

                <input
                  value={form.orderId}
                  onChange={(event) =>
                    updateField("orderId", event.target.value)
                  }
                  placeholder="Paste order ID"
                  className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  Courier Name
                </span>

                <input
                  value={form.courierName}
                  onChange={(event) =>
                    updateField("courierName", event.target.value)
                  }
                  placeholder="Steadfast / Pathao / RedX"
                  className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  Courier Phone
                </span>

                <input
                  value={form.courierPhone}
                  onChange={(event) =>
                    updateField("courierPhone", event.target.value)
                  }
                  placeholder="Courier contact phone"
                  className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  Courier Email
                </span>

                <input
                  value={form.courierEmail}
                  onChange={(event) =>
                    updateField("courierEmail", event.target.value)
                  }
                  placeholder="Courier email"
                  className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">
                    Tracking Code
                  </span>

                  <input
                    value={form.trackingCode}
                    onChange={(event) =>
                      updateField("trackingCode", event.target.value)
                    }
                    placeholder="Tracking code"
                    className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">
                    Tracking URL
                  </span>

                  <input
                    value={form.trackingUrl}
                    onChange={(event) =>
                      updateField("trackingUrl", event.target.value)
                    }
                    placeholder="https://..."
                    className="rounded-xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {result && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {result}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  disabled={loading}
                  onClick={assignCourierOnly}
                  className="rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900"
                >
                  Assign Courier
                </button>

                <button
                  disabled={loading}
                  onClick={createTrackingOnly}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  Create Tracking
                </button>

                <button
                  disabled={loading}
                  onClick={assignAndTrack}
                  className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  Assign + Track
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-bold">
              Workflow
            </h2>

            <div className="mt-5 space-y-4 text-sm text-zinc-500">
              <p>
                1. Paste Order ID from Orders page.
              </p>
              <p>
                2. Assign courier partner.
              </p>
              <p>
                3. Add tracking code and URL.
              </p>
              <p>
                4. Customer can track order from Storefront.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
