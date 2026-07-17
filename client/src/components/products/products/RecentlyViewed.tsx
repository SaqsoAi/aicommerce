"use client";

import Link from "next/link";

import {
  useRecentlyViewedStore,
} from "@/store/recentlyViewed.store";

export default function RecentlyViewed() {
  const products =
    useRecentlyViewedStore(
      (state) =>
        state.products
    );

  if (
    products.length === 0
  ) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8">
        Recently Viewed
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        {products.map(
          (product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="
              border
              rounded-xl
              p-4
              hover:shadow-lg
            "
            >
              <h3 className="font-semibold">
                {product.name}
              </h3>

              <p className="mt-2">
                à§³{product.price}
              </p>
            </Link>
          )
        )}
      </div>
    </section>
  );
}

