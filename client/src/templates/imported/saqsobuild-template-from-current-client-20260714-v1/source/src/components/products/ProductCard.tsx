// PHASE_3_2_TOP_RISK_HARDENED
"use client";


import { useBrand } from "@/providers/BrandProvider";
import Link from "next/link";
import toast from "react-hot-toast";
import { normalizeImageUrl } from "@/lib/normalizeImageUrl";
import { useCartStore } from "@/store/cart.store";
import WishlistButton from "./WishlistButton";
import TryOnButton from "@/components/ai/TryOnButton";

type Props = {
  product: any;
};

export default function ProductCard({ product }: Props) {
  const { brand } = useBrand();
  const addToCart = useCartStore((state) => state.addToCart);
  const now = new Date();

  const publishAt =
    product.publishAt
      ? new Date(product.publishAt)
      : null;

  const unpublishAt =
    product.unpublishAt
      ? new Date(product.unpublishAt)
      : null;

  const isVisibleProduct =
    (product.approvalStatus ?? "APPROVED") === "APPROVED" &&
    (product.status ?? "ACTIVE") === "ACTIVE" &&
    (product.visibility ?? "PUBLIC") === "PUBLIC" &&
    (!publishAt || publishAt <= now) &&
    (!unpublishAt || unpublishAt > now);

  if (!isVisibleProduct) {
    return null;
  }


  const image = normalizeImageUrl(
    product.thumbnail ||
      product.images?.[0]?.url ||
      product.gallery?.[0]?.url ||
      null
  );

  const hasDiscount =
    product.discountPrice &&
    product.discountPrice < product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const totalStock =
    product.variants?.reduce(
      (sum: number, variant: any) =>
        sum + Number(variant.availableStock ?? variant.stock ?? 0),
      0
    ) ?? 0;

  const firstVariant = product.variants?.[0];

  const currentPrice = Number(
    firstVariant?.price ??
      product.discountPrice ??
      product.price ??
      0
  );

  const handleAddToCart = () => {
    if (totalStock <= 0) {
      toast.error("Out of stock");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image,
      quantity: 1,
      variantLabel:
        firstVariant?.color || firstVariant?.size
          ? `${firstVariant?.color || ""} ${firstVariant?.size || ""}`.trim()
          : undefined,
    });

    toast.success("Added to cart");
  };

  return (
    <div className="group h-full overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-950 transition-colors duration-200 motion-reduce:transition-none">
      <div className="relative flex h-80 items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <img loading="lazy" decoding="async"
          src={image}
          alt={product.name}
          className="h-full w-full object-contain p-2 transition-all duration-300 duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.featured && (
            <span className="rounded-full bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white shadow-[0_16px_45px_rgba(225,29,72,0.35)] dark:bg-black dark:text-white px-3 py-1 text-xs text-white">
              Featured
            </span>
          )}

          {product.trending && (
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs text-white">
              Trending
            </span>
          )}

          {hasDiscount && (
            <span className="rounded-full bg-green-600 px-3 py-1 text-xs text-white">
              -{discountPercent}%
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <WishlistButton productId={product.id} />
        </div>
      </div>

      <div className="space-y-4 p-6">

  <div className="flex gap-2">
    <div className="flex-1">
      <TryOnButton
        productId={product.id}
        variant="compact"
      />
    </div>
  </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {product.category?.name || "Product"}
            {product.brand?.name ? ` / ${product.brand.name}` : ""}
          </p>

          <Link
            href={`/product/${product.id}`}
            data-product-view-brand-button
            style={{ backgroundColor: brand.primaryColor }}
            className="mt-1 block line-clamp-2 text-lg font-bold text-zinc-900 hover:underline dark:text-zinc-100"
          >
            {product.name}
          </Link>

          <p className="mt-1 text-xs text-zinc-500">
            Style: {product.styleNo || "-"} | Stock: {totalStock}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasDiscount ? (
            <>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Tk {product.discountPrice}
              </span>

              <span className="text-sm text-zinc-400 line-through">
                Tk {product.price}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Tk {product.price}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/product/${product.id}`}
            data-product-view-brand-button
            style={{ backgroundColor: brand.primaryColor }}
            className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white shadow-[0_16px_45px_rgba(225,29,72,0.35)] dark:bg-black dark:text-white py-3 text-center text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            View
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={totalStock <= 0}
            className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-semibold hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900 transition-colors duration-200 motion-reduce:transition-none"
          >
            {totalStock > 0 ? "Add To Cart" : "Out Of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}






