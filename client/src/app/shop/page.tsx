"use client";


import { useBrand } from "@/providers/BrandProvider";
import ProductCatalogClient from "@/components/product-catalog/ProductCatalogClient";

export default function ShopPage() {
  const { brand } = useBrand();
  return (
    <>
      <section data-shop-brand-panel className="mx-auto mb-6 max-w-7xl rounded-[2rem] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">{brand.storeName} Shop</p>
        <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-black">Discover products curated by {brand.storeName}</h1>
      </section>
      <ProductCatalogClient />
    </>
  );
}

