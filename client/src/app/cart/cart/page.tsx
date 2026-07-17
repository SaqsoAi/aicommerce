"use client";

import Link from "next/link";
import { useBrand } from "@/providers/BrandProvider";
import { useCartStore } from "@/store/cart.store";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";

export default function CartPage() {
  const { brand } = useBrand();
  const { items } = useCartStore();

  return (
    <main className="cart-page min-h-screen bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-[#080808] px-6 py-5 text-white shadow-xl ring-1 ring-black/10 dark:ring-white/10">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-300">
            {brand.storeName} Shopping Bag
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-400">
            {brand.contactPhone || brand.contactEmail || "Support ready for your order"}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-700 dark:text-zinc-400">
              Shopping Bag
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#111111] dark:text-white">
              Your Cart
            </h1>
          </div>

          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-full border border-black/30 px-7 text-sm font-black uppercase tracking-[0.18em] text-[#111111] transition hover:bg-black hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-[28px] bg-[#080808] px-6 py-16 text-center text-white shadow-xl ring-1 ring-black/10 dark:ring-white/10">
            <h2 className="text-2xl font-black text-white">Your cart is empty</h2>
            <p className="mt-4 text-sm font-medium text-zinc-400">
              Add products to cart and come back here to checkout.
            </p>
            <Link
              href="/shop"
              style={{ backgroundColor: brand.primaryColor }}
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-black text-white shadow-lg transition hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-zinc-950">
              <CartSummary items={items} />

              <Link
                href="/checkout"
                style={{ backgroundColor: brand.primaryColor }}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full px-7 text-sm font-black text-white shadow-lg transition hover:scale-105"
              >
                Proceed To Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}