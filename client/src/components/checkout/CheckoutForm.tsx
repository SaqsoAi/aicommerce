"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/services/account.service";

type Props = {
  onSubmit: (data: any) => void;
  submitting?: boolean;
};

export default function CheckoutForm({ onSubmit, submitting = false }: Props) {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile();
        const profile = res?.data || {};

        setForm({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.addressLine1 || profile.address || "",
        });
      } catch (error) {
        console.error("Profile load failed", error);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const inputClass =
    "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/15";

  if (loading) {
    return (
      <div className="rounded-[1.6rem] border border-zinc-200 bg-white p-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        Loading customer profile...
      </div>
    );
  }

  return (
    <div className="rounded-[1.6rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
          Checkout
        </p>
        <h2 className="mt-2 text-xl sm:text-2xl sm:text-3xl font-black text-zinc-950 dark:text-slate-950 dark:text-white">
          Delivery Information
        </h2>
        <p className="mt-2 text-sm sm:text-[15px] text-zinc-500">
          Your saved profile information is loaded automatically. You can edit before placing the order.
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6">
        <input
          placeholder="Full Name"
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className={inputClass}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Phone"
          className={inputClass}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <textarea
          placeholder="Address"
          className={inputClass}
          rows={4}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <button
          type="button"
          disabled={submitting || !form.name.trim() || !form.phone.trim() || !form.address.trim()}
          onClick={() => onSubmit(form)}
          className="w-full rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 px-6 py-4 text-sm font-black text-white shadow-lg shadow-rose-950/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50 sm:text-[15px]"
        >
          {submitting ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}






