"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import ProductCard from "@/components/products/ProductCard";
import {
  getProductCatalogFilters,
  getProductCatalogProducts,
  getProductCatalogRecommended,
  getProductCatalogStylistPicks,
} from "@/api/product-catalog.api";

type FilterState = {
  search: string;
  category: string;
  size: string;
  color: string;
  priceMin: string;
  priceMax: string;
  occasion: string;
  style: string;
  sustainability: string;
  sort: string;
};

const initialFilters: FilterState = {
  search: "",
  category: "",
  size: "",
  color: "",
  priceMin: "",
  priceMax: "",
  occasion: "",
  style: "",
  sustainability: "",
  sort: "latest",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductCatalogClient() {
  const [filtersData, setFiltersData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [stylistPicks, setStylistPicks] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([key, value]) => key !== "sort" && value && value.length > 0
      ).length,
    [filters]
  );

  async function loadAll(nextFilters = filters) {
    setLoading(true);
    try {
      const query: Record<string, string> = {};
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) query[key] = value;
      });

      const [filterRes, productRes, picksRes, recRes] = await Promise.allSettled([
        getProductCatalogFilters(),
        getProductCatalogProducts(query),
        getProductCatalogStylistPicks(),
        getProductCatalogRecommended(),
      ]);

      if (filterRes.status === "fulfilled") setFiltersData(filterRes.value);
      if (productRes.status === "fulfilled") setProducts(productRes.value?.items || []);
      else setProducts([]);
      if (picksRes.status === "fulfilled") setStylistPicks(Array.isArray(picksRes.value) ? picksRes.value : []);
      else setStylistPicks([]);
      if (recRes.status === "fulfilled") setRecommended(Array.isArray(recRes.value) ? recRes.value : []);
      else setRecommended([]);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function updateFilter(key: keyof FilterState, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    loadAll(next);
  }

  function clearFilters() {
    setFilters(initialFilters);
    loadAll(initialFilters);
  }

  function setPriceRange(range: any) {
    const next = {
      ...filters,
      priceMin: String(range.min ?? ""),
      priceMax: range.max === null || range.max === undefined ? "" : String(range.max),
    };
    setFilters(next);
    loadAll(next);
  }

  const hotOffers = filtersData?.hotOffers || [];
  const categories = filtersData?.categories || [];
  const sizes = filtersData?.sizes || [];
  const colors = filtersData?.colors || [];
  const occasions = filtersData?.occasions || [];
  const styles = filtersData?.styles || [];
  const sustainability = filtersData?.sustainability || [];
  const priceRanges = filtersData?.priceRanges || [];

  const filterPanel = (
    <FilterPanel
      activeFilterCount={activeFilterCount}
      clearFilters={clearFilters}
      hotOffers={hotOffers}
      categories={categories}
      sizes={sizes}
      colors={colors}
      priceRanges={priceRanges}
      occasions={occasions}
      styles={styles}
      sustainability={sustainability}
      filters={filters}
      updateFilter={updateFilter}
      setPriceRange={setPriceRange}
    />
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-neutral-950 dark:bg-[#081221] dark:text-white">
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100 px-3 py-10 sm:px-4 sm:py-14 dark:border-white/10 dark:from-[#081221] dark:via-[#0f172a] dark:to-[#020617]">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="mx-auto max-w-[1500px]">
          <div className="rounded-[2rem] border border-neutral-200 bg-white/80 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              RoshniTemp Product Catalog
            </p>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                  Discover Your Style
                </h1>
                <p className="mt-4 max-w-3xl text-base text-neutral-600 dark:text-white/70">
                  Explore luxury collections with real categories, variants, offers, style attributes and premium catalog filters.
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-white/10 dark:bg-black/20">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:text-white/50">
                  Smart Search
                </label>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={filters.search}
                    onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") loadAll();
                    }}
                    placeholder="Search product, SKU, style no..."
                    className="min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-[#081221]"
                  />
                  <button onClick={() => loadAll()} className="rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-black">
                    Search
                  </button>
                </div>
                <button
                  onClick={() => alert("✨ AI Style It will connect to AI recommendation workflow.")}
                  className="mt-3 w-full rounded-2xl border border-blue-400/40 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-500/10 dark:text-blue-300"
                >
                  ✨ AI Style It
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-6 px-3 py-8 sm:px-4 lg:grid-cols-[300px_1fr] lg:gap-8">
        <aside className="hidden lg:block lg:sticky lg:top-[112px] lg:self-start">
          {filterPanel}
        </aside>

        <div className="min-w-0">
          <div className="sticky top-[92px] z-30 mb-5 rounded-3xl border border-neutral-200 bg-white/85 p-3 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#081221]/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-neutral-500">Showing {products.length} products</p>
                <h2 className="text-2xl font-black">Luxury Product Catalog</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterOpen(true)}
                  className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-black lg:hidden dark:border-white/10"
                >
                  Filters ({activeFilterCount})
                </button>

                <select
                  value={filters.sort}
                  onChange={(event) => updateFilter("sort", event.target.value)}
                  className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-[#081221]"
                >
                  <option value="latest">Latest</option>
                  <option value="trending">Trending</option>
                  <option value="price-low">Price Low</option>
                  <option value="price-high">Price High</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-3xl bg-neutral-100 sm:h-96 dark:bg-white/10" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 p-12 text-center dark:border-white/10">
              <h3 className="text-xl font-black">No products found</h3>
              <p className="mt-2 text-neutral-500">Try clearing filters or searching another keyword.</p>
              <button onClick={clearFilters} className="mt-5 rounded-xl bg-[#d4af37] px-5 py-3 font-bold text-black">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <CatalogSection title="Stylist Picks" subtitle="Curated from Lookbook">
            {stylistPicks.length === 0 ? (
              <EmptyMini text="No stylist picks found yet." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {stylistPicks.slice(0, 4).map((item: any) => (
                  <div key={item.id} className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <h3 className="font-black">{item.title || item.name || "Lookbook Pick"}</h3>
                    <p className="mt-2 text-sm text-neutral-500">{item.description || "Curated styling inspiration."}</p>
                  </div>
                ))}
              </div>
            )}
          </CatalogSection>

          <CatalogSection title="Recommended For You" subtitle="Featured and trending products">
            {recommended.length === 0 ? (
              <EmptyMini text="No recommended products yet." />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
                {recommended.slice(0, 10).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </CatalogSection>
        </div>
      </section>

      {filterOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <aside className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-[2rem] bg-white p-4 text-neutral-950 shadow-2xl dark:bg-[#081221] dark:text-white">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black">Filters</h3>
              <button onClick={() => setFilterOpen(false)} className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-black dark:border-white/10">
                Close
              </button>
            </div>
            {filterPanel}
          </aside>
        </div>
      ) : null}
    </main>
  );
}

function FilterPanel({
  activeFilterCount,
  clearFilters,
  hotOffers,
  categories,
  sizes,
  colors,
  priceRanges,
  occasions,
  styles,
  sustainability,
  filters,
  updateFilter,
  setPriceRange,
}: any) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-black">Filters</h2>
        <button onClick={clearFilters} className="text-xs font-bold text-[#d4af37]">
          Clear All ({activeFilterCount})
        </button>
      </div>

      <div className="space-y-4 overflow-x-hidden sm:space-y-6">
        <FilterGroup title="Hot Offer">
          <div className="space-y-2">
            {hotOffers.length === 0 ? (
              <p className="text-xs text-neutral-500">No active offers</p>
            ) : (
              hotOffers.slice(0, 8).map((offer: any) => (
                <button key={`${offer.type}-${offer.id}`} className="block w-full rounded-xl border border-neutral-200 px-3 py-2 text-left text-xs font-semibold hover:border-[#d4af37] dark:border-white/10">
                  {offer.label}
                </button>
              ))
            )}
          </div>
        </FilterGroup>

        <FilterGroup title="Category">
          <div className="space-y-2">
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => updateFilter("category", cat.slug)}
                className={cx(
                  "block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-white/10",
                  filters.category === cat.slug && "bg-neutral-950 text-white dark:bg-white dark:text-black"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Size">
          <ChipGrid items={sizes} value={filters.size} onChange={(v) => updateFilter("size", v)} />
        </FilterGroup>

        <FilterGroup title="Color">
          <ChipGrid items={colors} value={filters.color} onChange={(v) => updateFilter("color", v)} />
        </FilterGroup>

        <FilterGroup title="Price Range">
          <div className="space-y-2">
            {priceRanges.map((range: any) => (
              <button key={range.label} onClick={() => setPriceRange(range)} className="block w-full rounded-xl border border-neutral-200 px-3 py-2 text-left text-sm hover:border-[#d4af37] dark:border-white/10">
                {range.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Occasion">
          <ChipGrid items={occasions} value={filters.occasion} onChange={(v) => updateFilter("occasion", v)} />
        </FilterGroup>

        <FilterGroup title="Style Personality">
          <ChipGrid items={styles} value={filters.style} onChange={(v) => updateFilter("style", v)} />
        </FilterGroup>

        <FilterGroup title="Sustainability">
          <ChipGrid items={sustainability} value={filters.sustainability} onChange={(v) => updateFilter("sustainability", v)} />
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white/70 dark:border-white/10 dark:bg-white/[0.03]">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="text-xs font-black uppercase tracking-[0.22em] text-neutral-600 dark:text-white/60">{title}</span>
        <span className="text-lg font-black text-neutral-500 dark:text-white/60">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="border-t border-neutral-200 px-4 py-4 dark:border-white/10">{children}</div> : null}
    </section>
  );
}

function ChipGrid({ items, value, onChange }: { items: string[]; value: string; onChange: (value: string) => void }) {
  if (!items || items.length === 0) return <p className="text-xs text-neutral-500">No data</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(value === item ? "" : item)}
          className={cx(
            "rounded-xl border px-3 py-2 text-xs font-bold transition",
            value === item ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-neutral-200 hover:border-[#d4af37] dark:border-white/10"
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function CatalogSection({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="mt-12 rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37]">{subtitle}</p>
      <h2 className="mt-2 text-2xl font-black">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-white/10">
      {text}
    </div>
  );
}
