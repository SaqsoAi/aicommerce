"use client";

import { useEffect, useState } from "react";

import HeroRenderer from "@/components/heroes/HeroRenderer";

import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrendingProducts from "@/components/home/TrendingProducts";
import CategorySection from "@/components/home/CategorySection";

import RecentlyViewed from "@/components/products/RecentlyViewed";

import { getActiveHero } from "@/api/heroes.api";

import type { Hero } from "@/types/hero";

export default function HomeTemplate() {
  const [hero, setHero] =
    useState<Hero | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          await getActiveHero();

        setHero(data);
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load hero"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-10">
        Loading Hero...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <main className="w-full">
      {hero && (
        <HeroRenderer hero={hero} />
      )}

      <CategorySection />

      <FeaturedProducts />

      <TrendingProducts />

      <RecentlyViewed />
    </main>
  );
}


