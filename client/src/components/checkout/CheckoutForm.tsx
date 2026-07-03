"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/services/account.service";

type Props = {
  onSubmit: (data: any) => void;
};

export default function CheckoutForm({ onSubmit }: Props) {
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
    "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-950 dark:text-white dark:focus:border-white";

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
          onClick={() => onSubmit(form)}
          className="w-full rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white dark:bg-[#050505] text-white dark:bg-white text-slate-950 dark:bg-black dark:text-white dark:text-white dark:text-slate-950 dark:text-white px-6 py-4 text-sm sm:text-[15px] font-black text-slate-950 dark:text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}






