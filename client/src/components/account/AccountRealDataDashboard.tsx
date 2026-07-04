// PHASE_3_2_TOP_RISK_HARDENED
"use client";

import Link from "next/link";
import { Heart, Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

type AnyItem = Record<string, any>;

function token() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || localStorage.getItem("customerToken") || localStorage.getItem("authToken") || "";
}

function headers(): HeadersInit {
  const t = token();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function listFrom(json: any, keys: string[]) {
  for (const key of keys) {
    if (Array.isArray(json?.[key])) return json[key];
    if (Array.isArray(json?.data?.[key])) return json.data[key];
  }
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

function img(src?: string) {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  if (src.startsWith("/")) return `${SERVER}${src}`;
  return `${SERVER}/${src}`;
}

function productImage(item: AnyItem) {
  return img(
    item.image ||
    item.thumbnail ||
    item.product?.image ||
    item.product?.thumbnail ||
    item.product?.images?.[0] ||
    item.images?.[0]
  );
}

function title(item: AnyItem) {
  return item.title || item.name || item.product?.name || item.product?.title || "Product";
}

function price(item: AnyItem) {
  const value = item.price || item.salePrice || item.product?.price || item.total || item.totalAmount;
  if (!value) return "";
  return `৳${Number(value).toLocaleString()}`;
}

export default function AccountRealDataDashboard() {
  const [orders, setOrders] = useState<AnyItem[]>([]);
  const [wishlist, setWishlist] = useState<AnyItem[]>([]);
  const [recommended, setRecommended] = useState<AnyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;

    async function fetchFirst(urls: string[], keys: string[]) {
      for (const url of urls) {
        try {
          const res = await fetch(url, { headers: headers(), cache: "no-store" });
          if (!res.ok) continue;
          const json = await res.json();
          const list = listFrom(json, keys);
          if (list.length) return list;
        } catch {}
      }
      return [];
    }

    async function load() {
      const [orderList, wishList, recList] = await Promise.all([
        fetchFirst(
          [`${API}/orders/my`, `${API}/orders/user`, `${API}/orders/me`, `${API}/orders`],
          ["orders", "items"]
        ),
        fetchFirst(
          [`${API}/wishlist`, `${API}/wishlists`, `${API}/wishlist/me`],
          ["wishlist", "items", "products"]
        ),
        fetchFirst(
          [`${API}/recommendations`, `${API}/products/recommended`, `${API}/products?limit=6`, `${API}/products`],
          ["recommendations", "products", "items"]
        ),
      ]);

      let localWish: AnyItem[] = [];
      if (!wishList.length) {
        try {
          localWish = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
        } catch {}
      }

      if (live) {
        setOrders(orderList.slice(0, 4));
        setWishlist((wishList.length ? wishList : localWish).slice(0, 4));
        setRecommended(recList.slice(0, 3));
        setLoading(false);
      }
    }

    load();
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-[1.5rem] border border-white/10 bg-[#111114] p-5 text-white shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition-colors duration-200 motion-reduce:transition-none">
        <div className="flex items-center justify-between gap-4 enterprise-mobile-stack">
          <h2 className="text-xl font-black">Recent Orders</h2>
          <Link href="/orders" className="text-sm font-black text-rose-300">View All Orders</Link>
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/50 transition-colors duration-200 motion-reduce:transition-none">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/50 transition-colors duration-200 motion-reduce:transition-none">No real orders found yet.</div>
          ) : orders.map((order, i) => (
            <Link
              key={order.id || i}
              href={`/orders/${order.id || ""}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#18181b] p-4 transition hover:border-rose-300/50 enterprise-mobile-stack transition-colors duration-200 motion-reduce:transition-none"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                  {productImage(order.items?.[0] || order) ? (
                    <img src={productImage(order.items?.[0] || order)} alt="Order" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-white/35" />
                  )}
                </div>
                <div>
                  <p className="font-black">{order.orderNumber || order.invoiceNo || order.id || `Order ${i + 1}`}</p>
                  <p className="text-sm text-white/50">{price(order) || "Total unavailable"}</p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200 transition-colors duration-200 motion-reduce:transition-none">
                {order.status || "Pending"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/10 bg-[#111114] p-5 text-white shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition-colors duration-200 motion-reduce:transition-none">
        <div className="flex items-center justify-between gap-4 enterprise-mobile-stack">
          <div>
            <h2 className="text-xl font-black">My Wishlists</h2>
            <p className="text-sm text-white/50">{wishlist.length} real saved item{wishlist.length === 1 ? "" : "s"}</p>
          </div>
          <Link href="/wishlist" className="text-sm font-black text-rose-300">Open</Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 enterprise-mobile-stack">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/50 sm:col-span-2 lg:col-span-4 transition-colors duration-200 motion-reduce:transition-none">Loading wishlist...</div>
          ) : wishlist.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/50 sm:col-span-2 lg:col-span-4 transition-colors duration-200 motion-reduce:transition-none">No real wishlist items found yet.</div>
          ) : wishlist.map((item, i) => (
            <Link
              key={item.id || item.productId || i}
              href={item.href || `/product/${item.productId || item.product?.id || item.id || ""}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] transition hover:border-rose-300/50 transition-colors duration-200 motion-reduce:transition-none"
            >
              <div className="aspect-[4/3] bg-white/5">
                {productImage(item) ? (
                  <img src={productImage(item)} alt={title(item)} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Heart className="h-6 w-6 text-white/30" /></div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-black">{title(item)}</p>
                <p className="mt-1 text-xs text-white/45">Saved item</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/10 bg-[#111114] p-5 text-white shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition-colors duration-200 motion-reduce:transition-none">
        <div className="flex items-center justify-between gap-4 enterprise-mobile-stack">
          <div>
            <h2 className="text-xl font-black">Recommended For You</h2>
            <p className="text-sm text-white/50">Real catalog/product recommendation data.</p>
          </div>
          <Link href="/shop" className="text-sm font-black text-rose-300">View All</Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 enterprise-mobile-stack">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/50 sm:col-span-2 lg:col-span-3 transition-colors duration-200 motion-reduce:transition-none">Loading recommendations...</div>
          ) : recommended.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/50 sm:col-span-2 lg:col-span-3 transition-colors duration-200 motion-reduce:transition-none">No real recommendations found yet.</div>
          ) : recommended.map((item, i) => (
            <Link
              key={item.id || i}
              href={`/product/${item.productId || item.id || ""}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] transition hover:border-rose-300/50 transition-colors duration-200 motion-reduce:transition-none"
            >
              <div className="aspect-[4/3] bg-white/5">
                {productImage(item) ? (
                  <img src={productImage(item)} alt={title(item)} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><ShoppingBag className="h-7 w-7 text-white/30" /></div>
                )}
              </div>
              <div className="p-4">
                <p className="truncate font-black">{title(item)}</p>
                {price(item) ? <p className="mt-2 text-sm font-black text-rose-300">{price(item)}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
