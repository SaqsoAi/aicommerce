"use client";

import { useEffect, useState } from "react";

import {
  getTrendingProducts,
} from "@/services/home.service";

type Product = {
  id: string;

  name: string;

  price: number;

  thumbnail?: string | null;

  images?: {
    id: string;
    url: string;
    isThumbnail: boolean;
  }[];
};

export default function TrendingProducts() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response =
          await getTrendingProducts();

        setProducts(
          response.data || []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          Loading Trending Products...
        </div>
      </section>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">
          Trending Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(
            (product) => {
              const image =
                product.images?.find(
                  (img) =>
                    img.isThumbnail
                )?.url ??
                product.images?.[0]
                  ?.url ??
                product.thumbnail ??
                "";

              return (
                <div
                  key={product.id}
                  className="border rounded-2xl overflow-hidden bg-white shadow-sm"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="h-64 bg-gray-100" />
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-lg font-bold">
                      à§³{product.price}
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

