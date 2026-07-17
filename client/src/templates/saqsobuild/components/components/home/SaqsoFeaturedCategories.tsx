"use client";

import { useEffect, useMemo, useState } from "react";
import { getCategories } from "@/services/home.service";
import { resolveAssetUrl } from "@/utils/resolveAssetUrl";

type ApiCategory = {
  id?: string | number;
  _id?: string | number;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  subtitle?: string;
  image?: string | null;
  imageUrl?: string | null;
  thumbnail?: string | null;
};

type CategoryCard = {
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

const fallbackCategories: CategoryCard[] = [
  {
    title: "Men",
    subtitle: "Premium menswear essentials",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1200",
    href: "/shop?category=men",
  },
  {
    title: "Women",
    subtitle: "Modern fashion collections",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200",
    href: "/shop?category=women",
  },
  {
    title: "Kids",
    subtitle: "Comfortable daily style",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1200",
    href: "/shop?category=kids",
  },
  {
    title: "Accessories",
    subtitle: "Bags, belts and premium extras",
    image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1200",
    href: "/shop?category=accessories",
  },
  {
    title: "Shoes",
    subtitle: "Step into new-season designs",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200",
    href: "/shop?category=shoes",
  },
  {
    title: "New Season",
    subtitle: "Latest drops and curated edits",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200",
    href: "/shop?collection=new-season",
  },
];

const normalizeCategoryList = (payload: unknown): ApiCategory[] => {
  if (Array.isArray(payload)) return payload as ApiCategory[];

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.data)) return obj.data as ApiCategory[];

    if (obj.data && typeof obj.data === "object") {
      const data = obj.data as Record<string, unknown>;
      if (Array.isArray(data.data)) return data.data as ApiCategory[];
      if (Array.isArray(data.categories)) return data.categories as ApiCategory[];
    }

    if (Array.isArray(obj.categories)) return obj.categories as ApiCategory[];
  }

  return [];
};

const isInvalidCategoryImage = (value: string) =>
  !value || value.startsWith("local-category-image:");

const fallbackImageForCategory = (title: string) => {
  const normalized = title.toLowerCase();

  if (normalized.includes("women") || normalized.includes("female")) {
    return fallbackCategories[1].image;
  }

  if (normalized.includes("kid") || normalized.includes("junior")) {
    return fallbackCategories[2].image;
  }

  if (normalized.includes("accessor") || normalized.includes("wallet") || normalized.includes("belt")) {
    return fallbackCategories[3].image;
  }

  if (normalized.includes("shoe")) {
    return fallbackCategories[4].image;
  }

  return fallbackCategories[0].image;
};

const categoryImage = (category: ApiCategory) => {
  const image = category.image || category.imageUrl || category.thumbnail || "";
  const resolved = resolveAssetUrl(image);

  return isInvalidCategoryImage(image) || isInvalidCategoryImage(resolved)
    ? ""
    : resolved;
};

const categorySlug = (category: ApiCategory) => {
  const raw = category.slug || category.name || category.title || "category";
  return String(raw).trim().toLowerCase().replace(/\s+/g, "-");
};

const toCategoryCard = (category: ApiCategory): CategoryCard => {
  const title = category.name || category.title || "Category";

  return {
    title,
    subtitle:
      category.subtitle ||
      category.description ||
      "Explore curated products from this category.",
    image: categoryImage(category) || fallbackImageForCategory(title),
    href: `/shop?category=${encodeURIComponent(categorySlug(category))}`,
  };
};

export default function SaqsoFeaturedCategories() {
  const [adminCategories, setAdminCategories] = useState<CategoryCard[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const response = await getCategories();
        const categories = normalizeCategoryList(response)
          .filter((category) => category.name || category.title)
          .map(toCategoryCard);

        if (mounted) setAdminCategories(categories);
      } catch (error) {
        console.error("Homepage Category Load Error:", error);
      }
    };

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(
    () => (adminCategories.length ? adminCategories : fallbackCategories),
    [adminCategories]
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-4 sm:px-6 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">
            Shop By Category
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 dark:text-white md:text-3xl sm:text-2xl sm:text-3xl lg:text-4xl lg:text-5xl">
            Explore collections
          </h2>
        </div>

        <a href="/shop" className="text-sm font-black underline">
          View all
        </a>
      </div>

      <div className="grid gap-5 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {categories.slice(0, 8).map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="relative flex h-56 items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
              )}
            </div>

            <div className="bg-white p-5 dark:bg-zinc-950">
              <h3 className="text-xl font-black text-zinc-950 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {item.subtitle || "Discover premium styles"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
