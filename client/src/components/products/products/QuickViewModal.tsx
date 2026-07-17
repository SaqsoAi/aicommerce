"use client";

import Link from "next/link";
import { useState } from "react";
import TryOnButton from "@/components/ai/TryOnButton";

type Product = {
  id: string;
  name: string;
  price?: number;
  discountPrice?: number | null;
  thumbnail?: string | null;
  images?: string[] | null;
  stock?: number;
  brand?: {
    name?: string;
  } | null;
  category?: {
    name?: string;
  } | null;
};

type Props = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function QuickViewModal({
  product,
  open,
  onClose,
}: Props) {
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  if (!open) {
    return null;
  }

  const image =
    product.thumbnail ||
    product.images?.[0] ||
    "/placeholder-product.jpg";

  const finalPrice =
    product.discountPrice || product.price || 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative grid max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] bg-white shadow-2xl dark:bg-zinc-950 md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-white px-4 py-2 text-sm font-bold text-black shadow dark:bg-black dark:text-white"
        >
          Close
        </button>

        <div
          className="min-h-[520px] bg-zinc-100 bg-cover bg-center dark:bg-zinc-900"
          style={{
            backgroundImage: `url(${image})`,
          }}
        />

        <div className="space-y-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
              Quick View
            </p>

            <h2 className="mt-3 text-3xl font-black text-zinc-950 dark:text-white">
              {product.name}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              {product.brand?.name || "SAQSO"} · {product.category?.name || "Fashion"}
            </p>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-zinc-950 dark:text-white">
              Tk {finalPrice}
            </span>

            {product.discountPrice && product.price && (
              <span className="text-sm text-zinc-400 line-through">
                Tk {product.price}
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Select Size
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    selectedSize === size
                      ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Quantity
            </p>

            <div className="mt-3 inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 font-bold"
              >
                -
              </button>

              <span className="px-4 py-2 font-bold">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-4 py-2 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            <TryOnButton
              productId={product.id}
              variant="full"
            />

            <Link
              href={`/product/${product.id}`}
              className="rounded-2xl border border-zinc-950 px-5 py-4 text-center font-black text-zinc-950 transition hover:bg-zinc-950 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
            >
              View Full Product
            </Link>

            <Link
              href="/cart"
              className="rounded-2xl bg-zinc-950 px-5 py-4 text-center font-black text-white transition hover:bg-black dark:bg-white dark:text-black"
            >
              Add To Cart
            </Link>

            <Link
              href="/checkout"
              className="rounded-2xl border border-zinc-300 px-5 py-4 text-center font-black text-zinc-950 transition hover:border-zinc-950 dark:border-zinc-800 dark:text-white"
            >
              Buy Now
            </Link>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-900">
            Size: {selectedSize} · Quantity: {quantity}
          </div>
        </div>
      </div>
    </div>
  );
}

