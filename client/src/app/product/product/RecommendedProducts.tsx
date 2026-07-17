"use client";

import {
  useRecentlyViewedStore,
} from "@/store/recentlyViewed.store";

export default function RecommendedProducts() {
  const viewed =
    useRecentlyViewedStore(
      (state) =>
        state.products
    );

  if (
    viewed.length === 0
  ) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-6">
        Recommended For You
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        {viewed.map(
          (product) => (
            <div
              key={product.id}
              className="border rounded-xl p-4"
            >
              {product.name}
            </div>
          )
        )}
      </div>
    </section>
  );
}

