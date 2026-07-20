"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getProductImage } from "@/lib/product-image";
import { useCartStore } from "@/store/cart.store";
import TryOnButton from "@/components/ai/TryOnButton";
import WishlistButton from "./WishlistButton";

type Props = { product: any };

export default function ProductCard({ product }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);
  const now = new Date();
  const publishAt = product.publishAt ? new Date(product.publishAt) : null;
  const unpublishAt = product.unpublishAt ? new Date(product.unpublishAt) : null;
  const visible = (product.approvalStatus ?? "APPROVED") === "APPROVED" && (product.status ?? "ACTIVE") === "ACTIVE" && (product.visibility ?? "PUBLIC") === "PUBLIC" && (!publishAt || publishAt <= now) && (!unpublishAt || unpublishAt > now);
  if (!visible) return null;

  const image = getProductImage(product);
  const firstVariant = product.variants?.[0];
  const totalStock = product.variants?.length ? product.variants.reduce((sum: number, variant: any) => sum + Number(variant.availableStock ?? variant.stock ?? 0), 0) : Number(product.stock ?? product.availableStock ?? 0);
  const regularPrice = Number(product.price ?? firstVariant?.price ?? 0);
  const salePrice = Number(product.discountPrice ?? firstVariant?.price ?? regularPrice);
  const hasDiscount = salePrice > 0 && regularPrice > salePrice;
  const discount = hasDiscount ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
  const productHref = `/product/${product.id}`;
  const visibleSizes = Array.from(new Set((product.variants || []).map((variant: any) => String(variant.size || "").trim()).filter(Boolean))).slice(0, 5) as string[];

  function addItem() {
    if (totalStock <= 0) { toast.error("Out of stock"); return; }
    addToCart({ id: product.id, productId: product.id, name: product.name, price: salePrice, image, quantity: 1, variantLabel: firstVariant?.color || firstVariant?.size ? `${firstVariant?.color || ""} ${firstVariant?.size || ""}`.trim() : undefined });
    toast.success("Added to cart");
  }

  return <article className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-white/10 dark:bg-zinc-950 dark:hover:border-white/20">
    <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      <Link href={productHref} aria-label={`View ${product.name}`} className="block h-full w-full">
        <img loading="lazy" decoding="async" src={image} alt={product.name} onError={(event) => { event.currentTarget.src = "/placeholder-product.svg"; }} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
      </Link>
      <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
        {hasDiscount ? <span className="rounded bg-rose-600 px-2 py-1 text-[10px] font-bold text-white">-{discount}%</span> : null}
        {product.featured ? <span className="rounded bg-black/80 px-2 py-1 text-[10px] font-bold text-white">Featured</span> : null}
      </div>
      <div className="absolute right-2 top-2"><WishlistButton productId={product.id} /></div>
      {totalStock <= 0 ? <div className="absolute inset-x-0 bottom-0 bg-black/75 px-2 py-2 text-center text-[10px] font-bold uppercase text-white">Out of stock</div> : null}
    </div>

    <div className="flex flex-1 flex-col p-3 sm:p-4" data-saqso-product-card-body>
      <p className="truncate text-[10px] font-bold uppercase text-zinc-500">{product.category?.name || "Collection"}{product.brand?.name ? ` · ${product.brand.name}` : ""}</p>
      <Link href={productHref} className="mt-1 line-clamp-2 min-h-0 text-sm font-bold leading-5 text-zinc-900 hover:underline dark:text-white sm:text-base">{product.name}</Link>
      <div className="mt-1 flex min-h-7 flex-wrap items-baseline gap-x-2">
        <span className="text-base font-black text-zinc-950 dark:text-white sm:text-lg">Tk {salePrice.toLocaleString()}</span>
        {hasDiscount ? <span className="text-xs text-zinc-400 line-through">Tk {regularPrice.toLocaleString()}</span> : null}
      </div>
      <p className="mt-1 text-[11px] text-zinc-500">{totalStock > 0 ? `${totalStock} available` : "Currently unavailable"}</p>

      <div className="mt-auto space-y-2 pt-3">
        {visibleSizes.length ? <div className="flex flex-wrap gap-1" aria-label="Available sizes">{visibleSizes.map((size) => <span key={size} className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[9px] font-black text-black dark:border-white/20 dark:bg-zinc-900 dark:text-white">{size}</span>)}</div> : null}
        <TryOnButton productId={product.id} variant="compact" />
        <button type="button" data-saqso-button-tone="inverse" onClick={addItem} disabled={totalStock <= 0} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-3 text-xs font-black text-white shadow-sm transition hover:-translate-y-px hover:bg-zinc-800 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500">
          <ShoppingBag size={16} aria-hidden="true" /> {totalStock > 0 ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    </div>
  </article>;
}
