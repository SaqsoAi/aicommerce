"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { normalizeImageUrl } from "@/lib/normalizeImageUrl";
const API = "/api";

type Brand = {
  id: string;
  name: string;
  logo?: string | null;
};

export default function SaqsoEnterpriseSections() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [brandRes, productRes] =
          await Promise.all([
            fetch(`${API}/brands`),
            fetch(`${API}/products`),
          ]);

        const brandData = await brandRes.json();
        const productData = await productRes.json();

        setBrands(Array.isArray(brandData?.data) ? brandData.data : []);
        setProducts(Array.isArray(productData?.data) ? productData.data : []);
      } catch (error) {
        console.error("Saqso enterprise section load failed", error);
      }
    };

    void load();
  }, []);

  const newArrivals = products.slice(0, 8);

  const trending = useMemo(
    () => products.filter((item) => item.trending).slice(0, 8),
    [products]
  );

  const featured = useMemo(
    () => products.filter((item) => item.featured).slice(0, 8),
    [products]
  );

  return (
    <>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] bg-zinc-950 p-8 text-white">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
            Premium Brands
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-5xl">
            Trusted by modern fashion lovers
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {brands.slice(0, 10).map((brand) => (
              <a
                key={brand.id}
                href={`/shop?brand=${brand.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                  {brand.logo ? (
                    <img
                      src={normalizeImageUrl(brand.logo)}
                      alt={brand.name}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="font-black text-black">
                      {brand.name.slice(0, 1)}
                    </span>
                  )}
                </div>

                <span className="text-sm font-black">{brand.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <ProductRail
        title="New Arrivals"
        eyebrow="Fresh Drops"
        products={newArrivals}
      />

      <ProductRail
        title="Trending Now"
        eyebrow="AI Trend Picks"
        products={trending.length ? trending : newArrivals}
      />

      <ProductRail
        title="Featured Products"
        eyebrow="Editor Choice"
        products={featured.length ? featured : newArrivals}
      />

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-black p-8 text-white">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
              Membership
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Unlock SAQSO membership rewards
            </h2>
            <p className="mt-3 text-white/70">
              Shop more and qualify for premium membership cards with instant benefits.
            </p>
            <a
              href="/dashboard"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black text-black"
            >
              Claim Membership
            </a>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">
              Rewards
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Earn points with every purchase
            </h2>
            <p className="mt-3 text-zinc-500">
              Redeem rewards for discounts, free delivery and special offers.
            </p>
            <a
              href="/dashboard"
              className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-black"
            >
              View Rewards
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductRail({
  title,
  eyebrow,
  products,
}: {
  title: string;
  eyebrow: string;
  products: any[];
}) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-black md:text-5xl">
            {title}
          </h2>
        </div>

        <a href="/shop" className="text-sm font-black underline">
          Shop all
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:sm:grid-cols-2 lg:md:grid-cols-3 2xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

