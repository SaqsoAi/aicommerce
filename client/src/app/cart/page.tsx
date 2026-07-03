"use client";


import { useBrand } from "@/providers/BrandProvider";
import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";

export default function CartPage() {
  const { brand } = useBrand();
  const { items } = useCartStore();

  return (
    <main className="min-h-screen overflow-x-clip bg-[#030712] text-white bg-zinc-50 px-4 py-6 sm:py-8 lg:py-10 text-zinc-950 dark:bg-white text-slate-950 dark:bg-black dark:text-white dark:text-white sm:px-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-4 sm:px-6 lg:px-8">
        <div data-cart-brand-strip className="mb-6 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">{brand.storeName} Shopping Bag</p>
          <p className="mt-1 text-sm font-semibold text-zinc-500">{brand.contactPhone || brand.contactEmail || "Support ready for your order"}</p>
        </div>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
              Shopping Bag
            </p>
            <h1 className="mt-2 text-2xl sm:text-xl sm:text-2xl lg:text-3xl lg:text-4xl font-black md:text-xl sm:text-2xl lg:text-3xl sm:text-2xl sm:text-xl sm:text-2xl lg:text-3xl lg:text-4xl lg:text-3xl sm:text-4xl lg:text-5xl">
              Your Cart
            </h1>
          </div>

          <Link
            href="/shop"
            className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-black dark:border-zinc-800"
          >
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-2xl font-black">Your cart is empty</h2>
            <p className="mt-3 text-zinc-500">
              Add products to cart and come back here to checkout.
            </p>
            <Link
              href="/shop"
              style={{ backgroundColor: brand.primaryColor }} className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-black text-white"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <CartSummary items={items} />

              <Link
                href="/checkout"
                style={{ backgroundColor: brand.primaryColor }} className="flex w-full items-center justify-center rounded-2xl px-6 py-4 text-sm font-black text-white"
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



