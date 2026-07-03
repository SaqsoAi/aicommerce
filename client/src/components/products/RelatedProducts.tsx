"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "@/api/product.api";

type Props = {
  currentProductId: string;
  categoryId?: string;
};

export default function RelatedProducts({
  currentProductId,
  categoryId,
}: Props) {
  const [products, setProducts] =
    useState<any[]>([]);

  useEffect(() => {
    getProducts()
      .then((response) => {
        const list = response.data || [];

        setProducts(
          list
            .filter(
              (product: any) =>
                product.id !==
                  currentProductId &&
                (!categoryId ||
                  product.categoryId ===
                    categoryId)
            )
            .slice(0, 4)
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }, [currentProductId, categoryId]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">
          Related Products
        </h2>

        <p className="text-zinc-500">
          Similar items you may like.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

