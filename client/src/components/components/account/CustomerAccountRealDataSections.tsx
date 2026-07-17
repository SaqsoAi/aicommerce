"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

type Item = {
  id?: string;
  productId?: string;
  title?: string;
  name?: string;
  image?: string;
  thumbnail?: string;
  price?: number | string;
  href?: string;
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || localStorage.getItem("customerToken") || "";
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function imageOf(item: Item) {
  return item.image || item.thumbnail || "";
}

function titleOf(item: Item) {
  return item.title || item.name || "Product";
}

export default function CustomerAccountRealDataSections() {
  const [wishlist, setWishlist] = useState<Item[]>([]);
  const [recommendations, setRecommendations] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadWishlist() {
      try {
        const res = await fetch(`${API}/wishlist`, {
          headers: authHeaders(),
          cache: "no-store",
        });

        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.wishlist)
              ? json.wishlist
              : Array.isArray(json)
                ? json
                : [];

          if (active) setWishlist(list.slice(0, 4));
          return;
        }
      } catch {}

      try {
        const local = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
        if (active) setWishlist(Array.isArray(local) ? local.slice(0, 4) : []);
      } catch {
        if (active) setWishlist([]);
      }
    }

    async function loadRecommendations() {
      const urls = [
        `${API}/recommendations`,
        `${API}/products/recommended`,
        `${API}/products`,
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url, {
            headers: authHeaders(),
            cache: "no-store",
          });

          if (!res.ok) continue;

          const json = await res.json();
          const list = Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.products)
              ? json.products
              : Array.isArray(json)
                ? json
                : [];

          if (list.length) {
            if (active) setRecommendations(list.slice(0, 3));
            return;
          }
        } catch {}
      }

      if (active) setRecommendations([]);
    }

    Promise.all([loadWishlist(), loadRecommendations()]).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="rounded-[1.5rem] border border-white/10 bg-[#111114] p-5 text-white shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">My Wishlists</h2>
            <p className="mt-1 text-sm text-white/50">
              {wishlist.length} real saved item{wishlist.length === 1 ? "" : "s"}
            </p>
          </div>
          <Link href="/wishlist" className="text-sm font-black text-rose-300">
            + New List
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/50 sm:col-span-2 lg:col-span-4">
              Loading wishlist...
            </div>
          ) : wishlist.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/50 sm:col-span-2 lg:col-span-4">
              No wishlist items yet.
            </div>
          ) : (
            wishlist.map((item, index) => (
              <Link
                key={item.id || item.productId || index}
                href={item.href || `/product/${item.productId || item.id || ""}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] transition hover:border-rose-300/50"
              >
                <div className="aspect-[4/3] bg-white/5">
                  {imageOf(item) ? (
                    <img src={imageOf(item)} alt={titleOf(item)} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Heart className="h-6 w-6 text-white/30" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-black">{titleOf(item)}</p>
                  <p className="mt-1 text-xs text-white/45">Saved item</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/10 bg-[#111114] p-5 text-white shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Recommended For You</h2>
            <p className="mt-1 text-sm text-white/50">
              Real product recommendations from catalog.
            </p>
          </div>
          <Link href="/shop" className="text-sm font-black text-rose-300">
            View All
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/50 sm:col-span-2 lg:col-span-3">
              Loading recommendations...
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/50 sm:col-span-2 lg:col-span-3">
              No recommendations available yet.
            </div>
          ) : (
            recommendations.map((item, index) => (
              <Link
                key={item.id || item.productId || index}
                href={`/product/${item.productId || item.id || ""}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] transition hover:border-rose-300/50"
              >
                <div className="aspect-[4/3] bg-white/5">
                  {imageOf(item) ? (
                    <img src={imageOf(item)} alt={titleOf(item)} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-7 w-7 text-white/30" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="truncate font-black">{titleOf(item)}</p>
                  {item.price ? (
                    <p className="mt-2 text-sm font-black text-rose-300">
                      ৳{Number(item.price).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  );
}
