"use client";

import { useEffect, useMemo, useState } from "react";
import {
  approveSizeFitReview,
  featureSizeFitReview,
  getSizeFitCenterSettings,
  getSizeFitReviews,
  updateSizeFitCenterSettings,
  type SizeFitCenterSettings,
  type SizeFitReview,
} from "@/api/sizeFitCenter.api";

type JsonKey = keyof Pick<
  SizeFitCenterSettings,
  | "heroJson"
  | "statsJson"
  | "menuJson"
  | "sizeGuideJson"
  | "fitGuideJson"
  | "measurementJson"
  | "guaranteeJson"
  | "helpJson"
  | "ctaJson"
  | "reviewSettingsJson"
  | "layoutJson"
>;

const jsonFields: { key: JsonKey; label: string; help: string }[] = [
  { key: "heroJson", label: "Hero Section", help: "Title, subtitle, badge, CTA buttons." },
  { key: "statsJson", label: "Stats Section", help: "Counter cards shown under hero." },
  { key: "menuJson", label: "Left Menu", help: "Sidebar menu labels, order, enable/disable." },
  { key: "sizeGuideJson", label: "Size Guide", help: "Size guide tab content." },
  { key: "fitGuideJson", label: "Fit Guide", help: "Fit guide tab content." },
  { key: "measurementJson", label: "How To Measure", help: "Measurement steps and help content." },
  { key: "guaranteeJson", label: "Fit Guarantee", help: "Guarantee points and policy text." },
  { key: "helpJson", label: "Need Help", help: "Support cards: chat, WhatsApp, call." },
  { key: "ctaJson", label: "CTA Section", help: "Footer CTA buttons and route links." },
  { key: "reviewSettingsJson", label: "Review Settings", help: "Approval, verified purchase, image rules." },
  { key: "layoutJson", label: "Layout Settings", help: "Enterprise style, sticky menu, dark/light mode." },
];

function stringify(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function parseJson(label: string, value: string) {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} JSON is invalid`);
  }
}

export default function SizeFitBuilder() {
  const [settings, setSettings] = useState<SizeFitCenterSettings | null>(null);
  const [form, setForm] = useState<Record<JsonKey, string>>({} as Record<JsonKey, string>);
  const [reviews, setReviews] = useState<SizeFitReview[]>([]);
  const [activeKey, setActiveKey] = useState<JsonKey>("heroJson");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeField = useMemo(
    () => jsonFields.find((item) => item.key === activeKey) || jsonFields[0],
    [activeKey]
  );

  async function load() {
    setLoading(true);

    const [settingsData, reviewData] = await Promise.all([
      getSizeFitCenterSettings(),
      getSizeFitReviews(),
    ]);

    const nextForm = {} as Record<JsonKey, string>;

    jsonFields.forEach((field) => {
      nextForm[field.key] = stringify(settingsData[field.key]);
    });

    setSettings(settingsData);
    setForm(nextForm);
    setReviews(reviewData);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((error) => {
      alert(error.message);
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);

    try {
      const payload: SizeFitCenterSettings = {
        active: true,
      };

      jsonFields.forEach((field) => {
        payload[field.key] = parseJson(field.label, form[field.key]);
      });

      const updated = await updateSizeFitCenterSettings(payload);
      setSettings(updated);
      alert("Size & Fit Center saved successfully.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Save failed");
    }

    setSaving(false);
  }

  async function toggleApprove(review: SizeFitReview) {
    await approveSizeFitReview(review.id, !review.isApproved);
    await load();
  }

  async function toggleFeature(review: SizeFitReview) {
    await featureSizeFitReview(review.id, !review.isFeatured);
    await load();
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
        Loading Size & Fit Builder...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
              CMS Builder
            </p>
            <h1 className="mt-2 text-3xl font-bold">Size & Fit Center Builder</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Control hero, menu, content panels, need help cards, CTA buttons and review settings.
              Client /size-fit-center updates from database.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="http://localhost:3000/size-fit-center"
              target="_blank"
              className="rounded-xl border px-4 py-2 text-sm font-medium"
            >
              Preview Client
            </a>
            <button
              type="button"
              onClick={load}
              className="rounded-xl border px-4 py-2 text-sm font-medium"
            >
              Reload
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border bg-white p-4 shadow-sm dark:bg-neutral-950">
          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Sections
          </div>
          <div className="space-y-2">
            {jsonFields.map((field) => (
              <button
                key={field.key}
                type="button"
                onClick={() => setActiveKey(field.key)}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                  activeKey === field.key
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
              >
                <span className="font-semibold">{field.label}</span>
                <span className="mt-1 block text-xs opacity-70">{field.help}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">{activeField.label}</h2>
              <p className="mt-1 text-sm text-neutral-500">{activeField.help}</p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-900">
              JSON CMS
            </span>
          </div>

          <textarea
            value={form[activeKey] || ""}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                [activeKey]: event.target.value,
              }))
            }
            spellCheck={false}
            className="min-h-[520px] w-full rounded-2xl border bg-neutral-50 p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-black dark:bg-neutral-900 dark:focus:ring-white"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
              Save {activeField.label}
            </button>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  [activeKey]: stringify(settings?.[activeKey]),
                }))
              }
              className="rounded-xl border px-5 py-2 text-sm font-semibold"
            >
              Reset This Section
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Customer Fit Reviews</h2>
            <p className="text-sm text-neutral-500">
              Approve, hide or feature real customer fit reviews.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-xl border px-4 py-2 text-sm font-medium"
          >
            Refresh Reviews
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-900">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Product</th>
                <th className="p-3">Fit</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td className="p-4 text-neutral-500" colSpan={5}>
                    No fit reviews found yet.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="border-t">
                    <td className="p-3">
                      <div className="font-semibold">{review.user?.name || "Customer"}</div>
                      <div className="text-xs text-neutral-500">
                        {review.verifiedPurchase ? "Verified Purchase" : "Not Verified"}
                      </div>
                    </td>
                    <td className="p-3">{review.product?.name || "Product"}</td>
                    <td className="p-3">
                      <div>{review.fitRating || "N/A"}</div>
                      <div className="text-xs text-neutral-500">
                        {review.sizeOrdered || "Size N/A"} · {review.bodyType || "Body N/A"}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-900">
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                      {review.isFeatured ? (
                        <span className="ml-2 rounded-full bg-neutral-900 px-3 py-1 text-xs text-white dark:bg-white dark:text-black">
                          Featured
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleApprove(review)}
                          className="rounded-lg border px-3 py-1"
                        >
                          {review.isApproved ? "Hide" : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFeature(review)}
                          className="rounded-lg border px-3 py-1"
                        >
                          {review.isFeatured ? "Unfeature" : "Feature"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}