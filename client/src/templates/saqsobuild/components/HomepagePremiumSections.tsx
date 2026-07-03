"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getFeaturedProducts,
  getProducts,
  getTrendingProducts,
} from "@/api/product.api";

type Product = {
  id?: string | number;
  _id?: string | number;
  name?: string;
  title?: string;
  slug?: string;
  price?: number | string;
  salePrice?: number | string;
  discountPrice?: number | string;
  image?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  images?: Array<string | { url?: string; src?: string }>;
  category?: string | { name?: string };
  brand?: string | { name?: string };
};

const money = (value: unknown) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  return `৳${n.toLocaleString("en-BD")}`;
};

const productId = (p: Product) => String(p.id || p._id || p.slug || "");
const productName = (p: Product) => p.name || p.title || "Premium Product";

const productImage = (p: Product) => {
  if (p.image) return p.image;
  if (p.thumbnail) return p.thumbnail;
  if (p.thumbnailUrl) return p.thumbnailUrl;
  if (p.imageUrl) return p.imageUrl;
  const first = p.images?.[0];
  if (typeof first === "string") return first;
  return first?.url || first?.src || "";
};

const normalizeList = (payload: unknown): Product[] => {
  if (Array.isArray(payload)) return payload as Product[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Product[];
    if (Array.isArray(obj.products)) return obj.products as Product[];
    if (obj.data && typeof obj.data === "object") {
      const data = obj.data as Record<string, unknown>;
      if (Array.isArray(data.products)) return data.products as Product[];
      if (Array.isArray(data.data)) return data.data as Product[];
    }
  }
  return [];
};

function useHomepageProducts() {
  const [trending, setTrending] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.allSettled([
      getTrendingProducts(),
      getFeaturedProducts(),
      getProducts(),
    ])
      .then(([trendRes, featRes, allRes]) => {
        if (!alive) return;

        const trend =
          trendRes.status === "fulfilled" ? normalizeList(trendRes.value) : [];
        const feat =
          featRes.status === "fulfilled" ? normalizeList(featRes.value) : [];
        const all =
          allRes.status === "fulfilled" ? normalizeList(allRes.value) : [];

        setAllProducts(all);
        setTrending(trend.length ? trend : all.slice(0, 8));
        setFeatured(feat.length ? feat : all.slice(0, 8));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { trending, featured, allProducts, loading };
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <div className="mx-auto mb-8 flex w-full max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-500">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex w-fit items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
        >
          View All
        </Link>
      )}
    </div>
  );
}

function ProductTile({ product, index }: { product: Product; index: number }) {
  const id = productId(product);
  const href = id ? `/product/${id}` : "/shop";
  const image = productImage(product);
  const price = product.salePrice || product.discountPrice || product.price;
  const original =
    product.salePrice || product.discountPrice ? product.price : undefined;

  return (
    <article className="group min-w-[250px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.06]">
      <Link href={href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-900">
          {image ? (
            <img
              src={image}
              alt={productName(product)}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading={index < 4 ? "eager" : "lazy"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-50 text-center text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
              No Image
            </div>
          )}

          <div className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur">
            AI Pick
          </div>
        </div>
      </Link>

      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          Premium
        </p>
        <Link href={href}>
          <h3 className="mt-2 line-clamp-2 min-h-[3rem] text-base font-black text-slate-950 transition group-hover:text-amber-600 dark:text-white">
            {productName(product)}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-black text-slate-950 dark:text-white">
            {money(price)}
          </span>
          {original && (
            <span className="text-sm font-bold text-slate-400 line-through">
              {money(original)}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/virtual-tryon"
            className="rounded-full border border-slate-200 px-3 py-2 text-center text-xs font-black text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Try-On
          </Link>
          <Link
            href={href}
            className="rounded-full bg-slate-950 px-3 py-2 text-center text-xs font-black text-white transition hover:bg-amber-600 dark:bg-white dark:text-slate-950"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductRail({
  products,
  loading,
  mode = "rail",
}: {
  products: Product[];
  loading: boolean;
  mode?: "rail" | "grid";
}) {
  if (loading) {
    return (
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[430px] animate-pulse rounded-[2rem] bg-slate-100 dark:bg-white/[0.06]"
          />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-dashed border-slate-300 p-10 text-center text-sm font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
          No products available yet.
        </div>
      </div>
    );
  }

  if (mode === "grid") {
    return (
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {products.slice(0, 8).map((product, index) => (
          <ProductTile key={`${productId(product)}-${index}`} product={product} index={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="flex gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.slice(0, 10).map((product, index) => (
          <ProductTile key={`${productId(product)}-${index}`} product={product} index={index} />
        ))}
      </div>
    </div>
  );
}

function AITrendPicksContent({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  return (
    <section className="bg-slate-50 py-14 dark:bg-slate-900/40">
      <SectionHeader
        eyebrow="Trending Now"
        title="AI Trend Picks"
        description="Real product feed loaded after the Hero section with premium horizontal browsing."
        href="/shop"
      />
      <ProductRail products={products} loading={loading} />
    </section>
  );
}

export function SaqsoAITrendPicksSection() {
  const { trending, loading } = useHomepageProducts();

  return <AITrendPicksContent products={trending} loading={loading} />;
}
function LifestyleSection() {
  const cards = [
    {
      title: "Workwear Power",
      text: "Sharp daily essentials for office, meeting and smart casual moments.",
      href: "/shop?lifestyle=workwear",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Weekend Ease",
      text: "Relaxed pieces, soft layers and effortless styling for every weekend.",
      href: "/shop?lifestyle=weekend",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Occasion Ready",
      text: "Premium edits for events, celebrations and evening looks.",
      href: "/shop?lifestyle=occasion",
      image:
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <section className="bg-white py-14 dark:bg-slate-950">
      <SectionHeader
        eyebrow="Shop By Lifestyle"
        title="Choose your style mood"
        description="Lifestyle-led merchandising inspired by the reference layout: clean image cards, premium copy and direct shopping paths."
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group relative min-h-[380px] overflow-hidden rounded-[2.25rem] bg-slate-900 shadow-sm"
          >
            <img
              src={card.image}
              alt={card.title}
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
                Lifestyle
              </p>
              <h3 className="mt-3 text-3xl font-black">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/80">{card.text}</p>
              <span className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition group-hover:bg-amber-400">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CollectionsSection({ products }: { products: Product[] }) {
  const categories = useMemo(() => {
    const names = new Set<string>();
    products.forEach((p) => {
      const c =
        typeof p.category === "string" ? p.category : p.category?.name || "";
      if (c) names.add(c);
    });

    const list = Array.from(names).slice(0, 4);
    return list.length ? list : ["New Arrivals", "Best Sellers", "Premium Edit", "AI Picks"];
  }, [products]);

  return (
    <section className="bg-slate-50 py-14 dark:bg-slate-900/40">
      <SectionHeader
        eyebrow="Explore Collections"
        title="Curated drops for every customer"
        description="Editorial collection blocks placed after Lifestyle, matching the homepage order requested from the screenshots."
        href="/shop"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        {categories.map((name, i) => (
          <Link
            key={name}
            href={`/shop?category=${encodeURIComponent(name)}`}
            className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.06]"
          >
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-500">
                  Collection 0{i + 1}
                </p>
                <h3 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
                  {name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Discover selected products, trending silhouettes and premium essentials.
                </p>
              </div>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xl font-black text-white transition group-hover:bg-amber-500 dark:bg-white dark:text-slate-950">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MembershipBannerSection() {
  return (
    <section className="bg-white py-14 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl sm:p-10 lg:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">
                Membership Banner
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
                Unlock member rewards, exclusive pricing and premium shopping benefits.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75">
                Designed for the 4th section in the requested homepage order. Customers see a strong CTA before Featured Products.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/membership"
                  className="rounded-full bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-white"
                >
                  Join Membership
                </Link>
                <Link
                  href="/shop"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Shop To Unlock
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-white/60">
                Benefits
              </p>
              <div className="mt-5 grid gap-3">
                {["Instant discount", "Reward points", "Exclusive offers", "Birthday gifts"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomepagePremiumSections() {
  const { trending, featured, allProducts, loading } = useHomepageProducts();

  return (
    <>
      <AITrendPicksContent products={trending} loading={loading} />


      <LifestyleSection />

      <CollectionsSection products={allProducts} />

      <MembershipBannerSection />

      <section className="bg-slate-50 py-14 dark:bg-slate-900/40">
        <SectionHeader
          eyebrow="Featured Products"
          title="Selected for today"
          description="Featured products are displayed after membership banner, following the exact requested order."
          href="/shop"
        />
        <ProductRail products={featured} loading={loading} mode="grid" />
      </section>
    </>
  );
}
