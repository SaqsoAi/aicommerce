"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

type WishlistItem = {
  id: string;
  title: string;
  image?: string;
  price?: string;
  href?: string;
  createdAt?: string;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  function load() {
    try {
      setItems(JSON.parse(localStorage.getItem("wishlistItems") || "[]"));
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
    window.addEventListener("wishlist:updated", load);
    return () => window.removeEventListener("wishlist:updated", load);
  }, []);

  function removeItem(id: string) {
    const next = items.filter((item) => String(item.id) !== String(id));
    localStorage.setItem("wishlistItems", JSON.stringify(next));
    setItems(next);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#111114] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)] sm:p-7">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-rose-300">
            Wishlist
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Saved Favorites
          </h1>
          <p className="mt-2 text-sm font-semibold text-white/60">
            Save favorites and continue shopping anytime.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-[#08080a] p-8 text-center">
            <Heart className="mx-auto h-10 w-10 text-white/35" />
            <h2 className="mt-4 text-xl font-black">No wishlist items yet</h2>
            <p className="mt-2 text-sm text-white/55">
              Add products from product detail page.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-[0_16px_45px_rgba(225,29,72,0.35)]"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0b0d] shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
              >
                <div className="aspect-square bg-white/5">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-10 w-10 text-white/25" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="line-clamp-2 text-base font-black">
                    {item.title}
                  </h3>
                  {item.price ? (
                    <p className="mt-2 text-sm font-black text-rose-300">
                      {item.price}
                    </p>
                  ) : null}

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={item.href || "/shop"}
                      className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-xs font-black text-black"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-xl border border-white/10 px-4 py-3 text-white/70 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
