"use client";

import { useEffect, useState } from "react";

import {
  getCategories,
} from "@/services/home.service";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

export default function CategorySection() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response =
          await getCategories();

        setCategories(
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
          Loading Categories...
        </div>
      </section>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">
          Shop By Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(
            (category) => (
              <div
                key={category.id}
                className="border rounded-2xl overflow-hidden bg-white hover:shadow-lg transition"
              >
                {category.image ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gray-100" />
                )}

                <div className="p-6 text-center">
                  <div className="text-lg font-semibold">
                    {category.name}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

