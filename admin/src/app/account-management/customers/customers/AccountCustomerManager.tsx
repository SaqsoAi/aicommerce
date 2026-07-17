"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/api/client";

type Customer = { id: string; name: string; email: string; phone?: string; emailVerified: boolean; createdAt: string; _count: { orders: number; wishlist: number }; account?: { displayName?: string; membership?: { tier: string; stylePoints: number }; rewards?: Array<{ points: number }>; addresses?: Array<{ id: string }> } | null };

export default function AccountCustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const response = await api.get("/account/admin/customers"); setCustomers(response.data?.data || []); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Customer accounts could not be loaded"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const visible = useMemo(() => customers.filter((item) => `${item.name} ${item.email} ${item.phone || ""}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);

  return <main className="min-h-screen bg-[#070b14] px-4 py-6 text-white md:px-7">
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-bold uppercase text-cyan-300">Customer Management</p><h1 className="mt-2 text-2xl font-black">Customer Accounts</h1><p className="mt-2 text-sm text-slate-400">Real profile, order, wishlist, membership, reward and address coverage.</p></div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer" className="h-11 w-full max-w-sm rounded-md border border-white/15 bg-[#0d1422] px-4 text-sm outline-none focus:border-cyan-400" />
      </header>
      {error ? <div className="mt-5 border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{error} <button onClick={load} className="ml-3 font-bold underline">Retry</button></div> : null}
      <div className="mt-5 overflow-x-auto border border-white/10">
        <table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-[#0d1422] text-slate-400"><tr>{["Customer","Contact","Orders","Wishlist","Membership","Rewards","Addresses","Status"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
          <tbody>{visible.map((customer) => { const rewards=(customer.account?.rewards || []).reduce((sum,item)=>sum+item.points,0); return <tr key={customer.id} className="border-t border-white/10"><td className="px-4 py-4"><b>{customer.account?.displayName || customer.name}</b><p className="text-xs text-slate-500">{customer.id}</p></td><td className="px-4 py-4">{customer.email}<p className="text-xs text-slate-500">{customer.phone || "No phone"}</p></td><td className="px-4 py-4">{customer._count.orders}</td><td className="px-4 py-4">{customer._count.wishlist}</td><td className="px-4 py-4">{customer.account?.membership?.tier || "Not enrolled"}</td><td className="px-4 py-4">{rewards}</td><td className="px-4 py-4">{customer.account?.addresses?.length || 0}</td><td className="px-4 py-4">{customer.emailVerified ? "Verified" : "Pending"}</td></tr>; })}</tbody>
        </table>
        {!loading && !visible.length ? <p className="p-6 text-center text-sm text-slate-400">No matching customers.</p> : null}
        {loading ? <p className="p-6 text-center text-sm text-slate-400">Loading customer accounts...</p> : null}
      </div>
    </div>
  </main>;
}
