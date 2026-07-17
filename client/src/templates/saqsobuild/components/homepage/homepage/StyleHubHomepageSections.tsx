"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Heart,
  Leaf,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useBrand } from "@/providers/BrandProvider";

type Product = {
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
  price?: number | string;
  salePrice?: number | string;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  category?: string | { name?: string };
};

type CollectionCard = {
  label: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop",
  "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506629905607-d9c297d6f5f1?q=80&w=1200&auto=format&fit=crop",
];

const collections: CollectionCard[] = [
  {
    label: "Just In",
    title: "New Arrivals",
    subtitle: "Fresh styles for the season",
    href: "/shop?collection=new-arrivals",
    image: fallbackImages[0],
  },
  {
    label: "Trending",
    title: "Seasonal Essentials",
    subtitle: "Cold-weather wardrobe updates",
    href: "/shop?collection=seasonal",
    image: fallbackImages[1],
  },
  {
    label: "Eco-Friendly",
    title: "Sustainable Picks",
    subtitle: "Responsible fashion edits",
    href: "/shop?collection=sustainable",
    image: fallbackImages[2],
  },
  {
    label: "Weekend",
    title: "Work & Weekend",
    subtitle: "Smart casual looks",
    href: "/shop?occasion=weekend",
    image: fallbackImages[3],
  },
  {
    label: "Edit",
    title: "Statement Pieces",
    subtitle: "Bold details and premium finish",
    href: "/shop?collection=statement",
    image: fallbackImages[1],
  },
  {
    label: "Trends",
    title: "Minimalist Edit",
    subtitle: "Clean looks for daily wear",
    href: "/shop?style=minimal",
    image: fallbackImages[2],
  },
];

const socialPosts = [
  { handle: "@sarah_styles", title: "Minimalist cotton tee", image: fallbackImages[0] },
  { handle: "@urban_fashion", title: "Denim outerwear mood", image: fallbackImages[1] },
  { handle: "@emma_style", title: "Weekend sustainable look", image: "" },
];

const styleBuckets = [
  { title: "Tops", items: ["Silk Blouse", "Cashmere Sweater", "Cotton Tee"] },
  { title: "Bottoms", items: ["Wide Pants", "Midi Skirt", "Denim Jeans"] },
  { title: "Shoes", items: ["Leather Loafers", "Block Heels"] },
  { title: "Accessories", items: ["Leather Handbag", "Minimal Necklace"] },
];

function assetUrl(src?: string) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

function money(value?: number | string) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return "BDT 0";
  return `BDT ${parsed.toLocaleString("en-BD")}`;
}

function productImage(product: Product, index: number) {
  return assetUrl(product.imageUrl || product.image || product.thumbnail) || fallbackImages[index % fallbackImages.length];
}

function productHref(product: Product) {
  return `/product/${encodeURIComponent(String(product.slug || product.id || "details"))}`;
}

function normalizeProducts(payload: unknown): Product[] {
  if (Array.isArray(payload)) return payload as Product[];
  if (!payload || typeof payload !== "object") return [];
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data as Product[];
  if (obj.data && typeof obj.data === "object") {
    const data = obj.data as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data as Product[];
    if (Array.isArray(data.products)) return data.products as Product[];
  }
  if (Array.isArray(obj.products)) return obj.products as Product[];
  return [];
}

function useHomepageProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const json = await response.json();
        const list = normalizeProducts(json).filter((item) => item.name || item.title);
        if (mounted) setProducts(list);
      } catch (error) {
        console.error("Homepage Product Load Error:", error);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return products;
}

function SectionShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 ${className}`}>
      <div className="rounded-[2rem] border border-zinc-200/80 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-zinc-950/86 sm:p-8">
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto mb-7 max-w-3xl text-center">
      {eyebrow ? <p className="text-[11px] font-black uppercase tracking-[0.32em] text-emerald-700 dark:text-emerald-300">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-zinc-950 dark:text-white sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{subtitle}</p> : null}
    </div>
  );
}

export function HomepageHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { brand } = useBrand();

  const storeName = String(brand.storeName || brand.raw?.storeName || brand.shortName || "ISRA LIFESTYLE").trim();
  const logoUrl = assetUrl(brand.logoUrl || brand.footerLogoUrl || brand.raw?.logoUrl || brand.raw?.logo || "");
  const iconUrl = assetUrl(brand.appIconUrl || brand.raw?.appIconUrl || brand.raw?.faviconUrl || "");
  const shortName = String(brand.shortName || storeName).trim();

  const nav = [
    ["Home", "/"],
    ["New Arrivals", "/shop?collection=new-arrivals"],
    ["Lookbook", "/lookbook"],
    ["Size Guide", "/size-fit-center"],
    ["Account", "/account"],
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 h-[var(--stylehub-header-h)] border-b text-white transition-all duration-300",
          scrolled
            ? "border-white/10 bg-black/82 shadow-[0_16px_44px_rgba(0,0,0,.42)] backdrop-blur-xl"
            : "border-white/12 bg-black/62 shadow-none backdrop-blur-md",
        ].join(" ")}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-2 px-3 sm:px-5 lg:px-7">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 font-black">
            <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full border border-white/18 bg-white text-black shadow-[0_8px_22px_rgba(0,0,0,.28)]">
              {iconUrl ? (
                <img src={iconUrl} alt={`${storeName} icon`} className="h-full w-full object-contain object-center p-1" />
              ) : (
                <span className="text-[10px] font-black uppercase">{shortName.slice(0, 2)}</span>
              )}
            </span>

            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${storeName} logo`}
                className="h-5 w-auto max-w-[120px] object-contain object-left drop-shadow-[0_6px_18px_rgba(0,0,0,.45)] sm:h-5 sm:max-w-[140px]"
              />
            ) : (
              <span className="truncate font-serif text-xs font-black uppercase tracking-[0.04em] sm:text-sm">
                {storeName}
              </span>
            )}
          </Link>

          <nav className="hidden items-center gap-1 text-[10px] font-bold text-white/88 lg:flex">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full px-3 py-1.5 transition hover:bg-white/14 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              className="hidden rounded-full border border-white/16 bg-black/20 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:inline-flex"
            >
              Shop
            </Link>
            <Link href="/search" aria-label="Search" className="grid h-8 w-8 place-items-center rounded-full border border-white/16 bg-black/20 text-white backdrop-blur-md transition hover:bg-white hover:text-black">
              <Search size={14} />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="hidden h-8 w-8 place-items-center rounded-full border border-white/16 bg-black/20 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:grid">
              <Heart size={14} />
            </Link>
            <Link href="/account" aria-label="Account" className="hidden h-8 w-8 place-items-center rounded-full border border-white/16 bg-black/20 text-white backdrop-blur-md transition hover:bg-white hover:text-black md:grid">
              <Sparkles size={14} />
            </Link>
            <Link href="/cart" aria-label="Cart" className="grid h-8 w-8 place-items-center rounded-full bg-white text-black shadow-[0_8px_22px_rgba(0,0,0,.32)] transition hover:-translate-y-0.5">
              <ShoppingBag size={14} />
            </Link>
            <button type="button" onClick={() => setOpen(true)} className="grid h-8 w-8 place-items-center rounded-full border border-white/16 bg-black/20 text-white backdrop-blur-md lg:hidden" aria-label="Open menu">
              <Menu size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className={["fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm transition lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0"].join(" ")} onClick={() => setOpen(false)} />
      <aside className={["fixed bottom-0 right-0 top-0 z-[90] w-[86vw] max-w-sm border-l border-white/10 bg-black/82 p-5 text-white shadow-2xl backdrop-blur-2xl transition-transform lg:hidden", open ? "translate-x-0" : "translate-x-full"].join(" ")}>
        <div className="flex items-center justify-between">
          <span className="flex min-w-0 items-center gap-2 font-black">
            <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-black">
              {iconUrl ? <img src={iconUrl} alt="" className="h-full w-full object-contain p-1" /> : shortName.slice(0, 2)}
            </span>
            <span className="truncate">{storeName}</span>
          </span>
          <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10" aria-label="Close menu">
            <X size={16} />
          </button>
        </div>
        <div className="mt-7 grid gap-3">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 font-bold">
              {label}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}

export function TrendingCollectionsSection() {
  return (
    <SectionShell>
      <SectionTitle title="Trending Collections" subtitle="Discover curated collections that define this season's style narrative." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((item) => (
          <Link key={item.title} href={item.href} className="group relative min-h-[240px] overflow-hidden rounded-3xl bg-zinc-100 shadow-sm sm:min-h-[330px]">
            <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute left-4 top-4 rounded-full bg-white/82 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-700 backdrop-blur">{item.label}</div>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h3 className="text-2xl font-black tracking-[-0.04em]">{item.title}</h3>
              <p className="mt-1 text-sm text-white/78">{item.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-7 text-center">
        <Link href="/shop" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950">
          View all collections <ChevronRight size={14} />
        </Link>
      </div>
    </SectionShell>
  );
}

export function StyleDiscoverySection() {
  return (
    <SectionShell>
      <SectionTitle title="Style Discovery Tools" subtitle="Create perfect outfits and find exactly what you're looking for with our connected style system." />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          {styleBuckets.map((bucket) => (
            <div key={bucket.title} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{bucket.title}</h3>
              <div className="mt-4 grid gap-3">
                {bucket.items.map((item, index) => (
                  <Link key={item} href={`/shop?style=${encodeURIComponent(item)}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-zinc-950">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-zinc-100 text-xs font-black dark:bg-white/10">0{index + 1}</span>
                    <span className="min-w-0 flex-1 text-sm font-bold">{item}</span>
                    <span className="text-xs font-black text-zinc-400">{money(1290 + index * 700)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-zinc-950 p-5 text-white dark:border-white/10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">Your Outfit</p>
          <div className="mt-5 grid gap-3 text-sm">
            {["Top", "Bottom", "Shoes", "Accessories"].map((item) => (
              <div key={item} className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50">{item}</span>
                <span>Not selected</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between text-sm font-black">
            <span>Total</span>
            <span>BDT 0</span>
          </div>
          <Link href="/shop?builder=outfit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-950">
            <Sparkles size={14} /> Add Outfit To Cart
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function SocialProofSection() {
  return (
    <SectionShell>
      <SectionTitle title="#StyleHubLook" subtitle="See how our community styles their favorite pieces." />
      <div className="grid gap-5 md:grid-cols-3">
        {socialPosts.map((post, index) => (
          <article key={post.handle} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950">
            <div className="flex items-center gap-3 border-b border-zinc-100 p-4 dark:border-white/10">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-xs font-black dark:bg-white/10">{index + 1}</span>
              <div>
                <p className="text-sm font-black">{post.handle}</p>
                <p className="text-xs text-zinc-500">Community style</p>
              </div>
            </div>
            <div className="relative h-72 bg-zinc-100 dark:bg-white/5">
              {post.image ? <img src={post.image} alt={post.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-zinc-400"><Upload size={44} /></div>}
            </div>
            <div className="p-4">
              <p className="text-sm font-bold">{post.title}</p>
              <p className="mt-2 text-xs text-zinc-500">Shop this look from live catalog data.</p>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function ShareStyleSection() {
  return (
    <SectionShell className="py-4">
      <div className="text-center">
        <h2 className="text-2xl font-black tracking-[-0.04em]">Share Your Style</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">Tag us with your look and join the fashion community.</p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/account" className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-zinc-950">Share Your Look</Link>
          <Link href="/lookbook" className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-black dark:border-white/10">Explore Styles</Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function CompleteLookSection() {
  const products = useHomepageProducts();
  const cards = useMemo(() => {
    if (products.length) return products.slice(0, 8);
    return [
      { id: "fallback-1", name: "Silk Wrap Blouse", price: 8490, image: fallbackImages[3] },
      { id: "fallback-2", name: "Denim Jacket", price: 12990, image: fallbackImages[1] },
      { id: "fallback-3", name: "Cotton Dress", price: 7990, image: fallbackImages[2] },
      { id: "fallback-4", name: "Leather Bag", price: 18990, image: fallbackImages[0] },
    ];
  }, [products]);

  return (
    <SectionShell>
      <SectionTitle title="Complete Your Look" subtitle="Personalized recommendations based on browsing history and real product data." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((product, index) => (
          <Link key={product.id || `${product.name}-${index}`} href={productHref(product)} className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-950">
            <div className="relative h-72 bg-zinc-100 dark:bg-white/5">
              <img src={productImage(product, index)} alt={product.name || product.title || "Product"} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-700 backdrop-blur">AI Pick</span>
            </div>
            <div className="p-4">
              <h3 className="line-clamp-1 text-sm font-black">{product.name || product.title || "Product"}</h3>
              <p className="mt-1 text-xs text-zinc-500">{typeof product.category === "object" ? product.category?.name : product.category || "Recommended"}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-black">{money(product.salePrice || product.price || 0)}</span>
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-black text-white dark:bg-white dark:text-zinc-950">View</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-7 text-center">
        <Link href="/shop?recommended=true" className="inline-flex rounded-full border border-zinc-200 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] dark:border-white/10">View more recommendations</Link>
      </div>
    </SectionShell>
  );
}

export function SustainabilitySection() {
  const items = [
    ["45%", "Carbon Footprint Reduction"],
    ["78%", "Recycled Materials"],
    ["92%", "Ethical Partners"],
    ["2.3m gal", "Water Saved"],
  ];

  return (
    <SectionShell>
      <SectionTitle eyebrow="Our Sustainability Commitment" title="Fashion that feels good and does good" subtitle="We are committed to creating a more sustainable future through responsible practices and transparent reporting." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([value, label]) => (
          <div key={label} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 text-center dark:border-white/10 dark:bg-white/5">
            <Leaf className="mx-auto text-emerald-600 dark:text-emerald-300" size={24} />
            <p className="mt-3 text-3xl font-black tracking-[-0.05em]">{value}</p>
            <p className="mt-1 text-xs font-bold text-zinc-500 dark:text-zinc-400">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <h3 className="font-black">2025 Sustainability Goals</h3>
          <ul className="mt-4 grid gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            <li>100% sustainable materials in core collections</li>
            <li>Carbon neutral shipping and packaging</li>
            <li>Zero waste to landfill from production</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 text-center dark:border-white/10 dark:bg-zinc-950">
          <ShieldCheck className="mx-auto text-emerald-600 dark:text-emerald-300" size={32} />
          <h3 className="mt-3 font-black">B-Corp Certified</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Recognized for high standards of social and environmental performance.</p>
        </div>
      </div>
    </SectionShell>
  );
}

export function HomepageAuditPanel() {
  const checks = [
    "Database -> API -> Client product binding",
    "Admin device-wise hero image preserved",
    "All CTA buttons route to prepared pages",
    "Dark and light mode field/text contrast",
    "Responsive desktop/tablet/mobile layout",
  ];

  return (
    <SectionShell className="pb-10">
      <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Validation</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Homepage Integration Coverage</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">This panel documents the missing-file/form/button/page/design/interface checks required before final polish.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {checks.map((check) => (
            <div key={check} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-bold dark:border-white/10 dark:bg-white/5">
              {check}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
