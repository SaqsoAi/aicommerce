"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart.store";

type Variant = {
  id?: string;
  color?: string;
  size?: string;
  stock?: number;
  availableStock?: number;
  price?: number | null;
  sku?: string;
  barcode?: string;
  image?: string | null;
  imageUrl?: string | null;
  images?: Array<{ url?: string | null } | string>;
};

type Props = {
  productId: string;
  productName: string;
  productImage?: string;
  variants?: Variant[];
  basePrice: number;
};

export default function ProductVariantSelector({
  variants = [],
  productId,
  productName,
  productImage,
  basePrice,
}: Props) {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();

  const colors = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .map((variant) => variant.color)
            .filter(Boolean)
        )
      ),
    [variants]
  );

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .filter((variant) =>
              selectedColor ? variant.color === selectedColor : true
            )
            .map((variant) => variant.size)
            .filter(Boolean)
        )
      ),
    [variants, selectedColor]
  );

  const selectedVariant =
    variants.find(
      (variant) =>
        variant.color === selectedColor &&
        variant.size === selectedSize
    ) || variants[0];

  const stock =
    selectedVariant?.availableStock ??
    selectedVariant?.stock ??
    0;

  const price =
    selectedVariant?.price ??
    basePrice;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select variant");
      return false;
    }

    if (colors.length && !selectedColor) {
      toast.error("Please select color");
      return false;
    }

    if (sizes.length && !selectedSize) {
      toast.error("Please select size");
      return false;
    }

    if (stock <= 0) {
      toast.error("Out of stock");
      return false;
    }

    const variantKey = selectedVariant.id || selectedVariant.sku || `${selectedColor || "default"}-${selectedSize || "default"}`;
    const variantImage = selectedVariant.imageUrl || selectedVariant.image || (typeof selectedVariant.images?.[0] === "string" ? selectedVariant.images[0] : selectedVariant.images?.[0]?.url) || productImage;

    addToCart({
      id: `${productId}:${variantKey}`,
      productId: productId,
      name: productName,
      image: variantImage || productImage,
      variantLabel: `${selectedColor || ""} ${selectedSize || ""}`.trim(),
      price: Number(price),
      quantity: 1,
    });

    toast.success("Added to cart");
    return true;
  };

  const handleBuyNow = () => {
    if (!handleAddToCart()) return;

    setTimeout(() => {
      router.push("/checkout");
    }, 150);
  };

  return (
    <div className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Select Variant
        </h3>

        <p className="text-sm text-zinc-500">
          Choose color and size before adding to cart.
        </p>
      </div>

      {colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Color</p>

          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setSelectedColor(color || "");
                  setSelectedSize("");
                }}
                className={`rounded-full border px-4 py-2 text-sm ${
                  selectedColor === color
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Size</p>

          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size || "")}
                className={`rounded-full border px-4 py-2 text-sm ${
                  selectedSize === size
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoCard label="Price" value={`Tk ${price}`} />
        <InfoCard
          label="Stock"
          value={stock > 0 ? `${stock} Available` : "Out of Stock"}
        />
        <InfoCard label="Variant SKU" value={selectedVariant?.sku || "-"} />
        <InfoCard label="Barcode" value={selectedVariant?.barcode || "-"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={stock <= 0}
          onClick={handleAddToCart}
          className="rounded-2xl bg-black px-6 py-4 font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-white dark:text-black"
        >
          {stock > 0 ? "Add To Cart" : "Out Of Stock"}
        </button>

        <button
          type="button"
          disabled={stock <= 0}
          onClick={handleBuyNow}
          className="rounded-2xl border border-zinc-300 bg-white px-6 py-4 font-semibold text-black hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        >
          Buy Now
        </button>
<button
  type="button"
  onClick={() => {
    const path = window.location.pathname;
    const id = path.split("/").filter(Boolean).pop() || String(Date.now());
    const title =
      document.querySelector("h1")?.textContent?.trim() ||
      document.title ||
      "Wishlist item";
    const image =
      document.querySelector("img")?.getAttribute("src") ||
      "";
    const price =
      document.body.textContent?.match(/৳\s*[\d,]+|TK\s*[\d,]+|\$\s*[\d,.]+/)?.[0] ||
      "";
    const key = "wishlistItems";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    const exists = list.some((item: any) => String(item.id) === String(id));

    if (!exists) {
      list.unshift({
        id,
        title,
        image,
        price,
        href: path,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(list));
    }

    window.dispatchEvent(new Event("wishlist:updated"));
    alert(exists ? "Already in wishlist" : "Added to wishlist");
  }}
  className="w-full rounded-2xl border border-white/15 bg-[#111114] px-5 py-4 text-center text-sm font-black text-white transition hover:border-rose-300/60 hover:bg-[#17171b]"
>
  Add To Wishlist
</button>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
      <p className="text-zinc-500">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}




