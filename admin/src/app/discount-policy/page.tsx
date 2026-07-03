"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getDiscountPolicy,
  updateDiscountPolicy,
} from "@/services/discount-policy.service";

const scopeOptions = [
  "NON_DISCOUNTED_ONLY",
  "DISCOUNTED_ONLY",
  "ALL_PRODUCTS",
  "DISABLED",
];

const conflictOptions = [
  "HIGHEST_DISCOUNT",
  "MEMBERSHIP_ONLY",
  "REWARD_ONLY",
];

export default function DiscountPolicyPage() {
  const [form, setForm] = useState<any>({
    membershipDiscountScope: "NON_DISCOUNTED_ONLY",
    rewardDiscountScope: "ALL_PRODUCTS",
    allowMembershipRewardTogether: true,
    conflictResolution: "HIGHEST_DISCOUNT",
    maxDiscountPercent: "",
    active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const res = await getDiscountPolicy();

      setForm({
        ...res.data,
        maxDiscountPercent: res.data?.maxDiscountPercent ?? "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPolicy();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      await updateDiscountPolicy(form);
      alert("Discount policy updated");
      await loadPolicy();
    } catch (error) {
      console.error(error);
      alert("Policy update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
            Checkout Policy Engine
          </p>
          <h1 className="mt-2 text-4xl font-black">
            Discount Policy
          </h1>
          <p className="mt-2 max-w-3xl text-zinc-500">
            Control membership discount, reward redemption, discounted product eligibility and combined discount rules.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <PolicyCard
            title="Membership Discount"
            value={form.membershipDiscountScope}
            description="Controls where membership discount applies."
          />

          <PolicyCard
            title="Reward Redemption"
            value={form.rewardDiscountScope}
            description="Controls where reward points can be used."
          />

          <PolicyCard
            title="Together Use"
            value={form.allowMembershipRewardTogether ? "Allowed" : "Not Allowed"}
            description="Controls if membership and reward can be used together."
          />
        </div>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 text-2xl font-black">
            Policy Settings
          </h2>

          {loading ? (
            <p className="text-zinc-500">Loading...</p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Membership Discount Scope">
                <select
                  value={form.membershipDiscountScope}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      membershipDiscountScope: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {scopeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Reward Discount Scope">
                <select
                  value={form.rewardDiscountScope}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rewardDiscountScope: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {scopeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Allow Membership + Reward Together">
                <select
                  value={form.allowMembershipRewardTogether ? "YES" : "NO"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      allowMembershipRewardTogether: e.target.value === "YES",
                    })
                  }
                  className="w-full rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </Field>

              <Field label="Conflict Resolution">
                <select
                  value={form.conflictResolution}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      conflictResolution: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {conflictOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Max Discount Percent">
                <input
                  value={form.maxDiscountPercent ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxDiscountPercent: e.target.value,
                    })
                  }
                  placeholder="Example: 30"
                  className="w-full rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </Field>

              <Field label="Policy Active">
                <select
                  value={form.active ? "YES" : "NO"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      active: e.target.value === "YES",
                    })
                  }
                  className="w-full rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </Field>
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="mt-8 rounded-2xl bg-black px-8 py-4 font-black text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {saving ? "Saving..." : "Save Policy"}
          </button>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-2xl font-black">
            Current Business Meaning
          </h2>

          <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <b>NON_DISCOUNTED_ONLY:</b> Apply only on regular price products.
            </p>
            <p>
              <b>DISCOUNTED_ONLY:</b> Apply only on already discounted products.
            </p>
            <p>
              <b>ALL_PRODUCTS:</b> Apply on all products.
            </p>
            <p>
              <b>DISABLED:</b> Disable that discount type.
            </p>
            <p>
              <b>HIGHEST_DISCOUNT:</b> If membership and reward cannot combine, the system will keep the bigger discount.
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-black text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function PolicyCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>
      <h3 className="mt-3 text-2xl font-black">{value}</h3>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
