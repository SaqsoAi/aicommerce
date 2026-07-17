"use client";

import { useEffect, useMemo, useState } from "react";

type WishlistRow = {
  id?: string;
  userId?: string;
  productId?: string;
  product?: {
    id?: string;
    name?: string;
    title?: string;
    sku?: string;
    price?: number;
  };
  createdAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function endpoint(path: string) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

export default function WishlistAdminPage() {
  const [items, setItems] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function loadWishlist() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint("/api/wishlist"), {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Wishlist API failed: ${response.status}`);
      const json = await response.json();
      const data = Array.isArray(json) ? json : json.data || json.items || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wishlist load failed");
    } finally {
      setLoading(false);
    }
  }

  async function removeWishlistItem(id?: string) {
    if (!id) return;
    const confirmed = window.confirm("Remove this wishlist item?");
    if (!confirmed) return;

    const response = await fetch(endpoint(`/api/wishlist/${id}`), {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      alert(`Delete failed: ${response.status}`);
      return;
    }

    await loadWishlist();
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const text = [
        item.id,
        item.userId,
        item.productId,
        item.product?.name,
        item.product?.title,
        item.product?.sku,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [items, query]);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-950/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
                Enterprise Admin Control
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Wishlist Management</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Admin management surface for customer wishlist records. Uses existing Wishlist API, schema and RBAC/audit/feature-flag infrastructure. No duplicate module.
              </p>
            </div>
            <button
              onClick={loadWishlist}
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <p className="text-xs text-slate-500">Total Records</p>
              <p className="mt-1 text-3xl font-semibold text-cyan-300">{items.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <p className="text-xs text-slate-500">API</p>
              <p className="mt-1 text-lg font-semibold">/api/wishlist</p>
            </div>
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <p className="text-xs text-slate-500">Schema</p>
              <p className="mt-1 text-lg font-semibold">Wishlist</p>
            </div>
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <p className="text-xs text-slate-500">Mode</p>
              <p className="mt-1 text-lg font-semibold text-emerald-300">Managed</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by user, product, SKU..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm outline-none transition focus:border-cyan-300 md:max-w-md"
            />
            <span className="text-sm text-slate-400">
              Showing {filtered.length} of {items.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-400">
              Loading wishlist records...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-200">
              {error}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-white/[0.05] text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Wishlist ID</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((item, index) => (
                    <tr key={item.id || `${item.userId}-${item.productId}-${index}`} className="bg-slate-950/40">
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">{item.id || "â€”"}</td>
                      <td className="px-4 py-3">{item.userId || "â€”"}</td>
                      <td className="px-4 py-3">{item.product?.name || item.product?.title || item.productId || "â€”"}</td>
                      <td className="px-4 py-3">{item.product?.sku || "â€”"}</td>
                      <td className="px-4 py-3">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "â€”"}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => removeWishlistItem(item.id)}
                          className="rounded-xl border border-red-300/30 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        No wishlist records found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
