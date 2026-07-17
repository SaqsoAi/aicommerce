"use client";

import { FormEvent, useState } from "react";

type Address = { id: string; label?: string; fullName?: string; phone?: string; line1: string; city?: string; country?: string; isDefault?: boolean };

export default function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [status, setStatus] = useState("");

  async function addAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("Saving...");
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/backend/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, isDefault: body.isDefault === "on" }) });
    const payload = await response.json();
    if (!response.ok || !payload?.success) { setStatus(payload?.message || "Address save failed"); return; }
    setAddresses((current) => [payload.data, ...current.map((item) => payload.data.isDefault ? { ...item, isDefault: false } : item)]);
    form.reset(); setStatus("Address saved");
  }

  async function removeAddress(id: string) {
    const response = await fetch(`/api/backend/account/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok || !payload?.success) { setStatus(payload?.message || "Address delete failed"); return; }
    setAddresses((current) => current.filter((item) => item.id !== id)); setStatus("Address removed");
  }

  return <div className="space-y-5">
    <form onSubmit={addAddress} className="grid gap-3 sm:grid-cols-2">
      <input name="label" placeholder="Label (Home)" className="rounded-lg border border-white/15 bg-black px-4 py-3" />
      <input name="fullName" placeholder="Full name" className="rounded-lg border border-white/15 bg-black px-4 py-3" />
      <input name="phone" placeholder="Phone" className="rounded-lg border border-white/15 bg-black px-4 py-3" />
      <input name="line1" required placeholder="Address line" className="rounded-lg border border-white/15 bg-black px-4 py-3" />
      <input name="city" placeholder="City" className="rounded-lg border border-white/15 bg-black px-4 py-3" />
      <input name="country" defaultValue="Bangladesh" placeholder="Country" className="rounded-lg border border-white/15 bg-black px-4 py-3" />
      <label className="flex items-center gap-2 text-sm"><input name="isDefault" type="checkbox" /> Default address</label>
      <button className="rounded-lg bg-white px-4 py-3 font-bold text-black">Add address</button>
    </form>
    {status ? <p className="text-sm text-zinc-300" role="status">{status}</p> : null}
    <div className="grid gap-3 sm:grid-cols-2">
      {addresses.map((address) => <article key={address.id} className="rounded-lg border border-white/10 bg-black/40 p-4">
        <div className="flex items-start justify-between gap-3"><div><b>{address.label || "Address"}{address.isDefault ? " · Default" : ""}</b><p className="mt-2 text-sm text-zinc-300">{address.line1}{address.city ? `, ${address.city}` : ""}</p><p className="text-sm text-zinc-400">{address.phone}</p></div><button type="button" onClick={() => removeAddress(address.id)} className="text-sm text-rose-300">Remove</button></div>
      </article>)}
      {!addresses.length ? <p className="text-sm text-zinc-400">No saved addresses.</p> : null}
    </div>
  </div>;
}
