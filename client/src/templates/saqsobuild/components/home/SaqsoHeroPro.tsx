"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBrand } from "@/providers/BrandProvider";

type Hero = {
  id: string;
  src?: string;
  desktopSrc?: string;
  laptopSrc?: string;
  tabletSrc?: string;
  mobileSrc?: string;
  alt?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  sliderEffect?: string;
  active?: boolean;
};

const API = "/api";

function assetUrl(src?: string) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

export default function SaqsoHeroPro() {
  const { brand } = useBrand();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch(`${API}/homepage-hero`, { cache: "no-store" });
        const json = await res.json();
        const list = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];
        const activeList = list.filter((x: Hero) => x.active !== false);
        if (mounted) setHeroes(activeList.length ? activeList : list);
      } catch (error) {
        console.error("Homepage Hero Client Error:", error);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (heroes.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActive((v) => (v + 1) % heroes.length);
      }
    }, 6500);
    return () => window.clearInterval(timer);
  }, [heroes.length]);

  const hero = heroes[active];
  const fallbackImage = assetUrl(
    hero?.desktopSrc || hero?.laptopSrc || hero?.tabletSrc || hero?.mobileSrc || hero?.src,
  );

  if (!hero) return null;

  return (
    <section data-saqso-hero="true" className="relative h-[var(--ai-hero-viewport)] min-h-[520px] overflow-hidden bg-black text-white md:min-h-[620px]">
      {fallbackImage ? (
        <picture>
          {hero.mobileSrc ? <source media="(max-width: 639px)" srcSet={assetUrl(hero.mobileSrc)} /> : null}
          {hero.tabletSrc ? <source media="(max-width: 1023px)" srcSet={assetUrl(hero.tabletSrc)} /> : null}
          {hero.laptopSrc ? <source media="(max-width: 1439px)" srcSet={assetUrl(hero.laptopSrc)} /> : null}
          <img src={fallbackImage} alt={hero.alt || hero.headline || "Hero"} loading="eager" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.86] contrast-[1.04] saturate-[1.02]" />
        </picture>
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/38 via-black/8 to-transparent" />

      <div className="relative z-10 flex h-full min-h-full items-end px-5 pb-[clamp(5.25rem,12vh,8rem)] pt-8 sm:items-center sm:px-8 sm:py-12 lg:px-12">
        <div className="w-full max-w-[min(92vw,640px)] md:max-w-2xl">
          <h1 className="max-w-3xl text-[36px] font-black leading-[0.98] tracking-[-0.04em] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.42)] sm:text-5xl md:text-6xl lg:text-7xl">
            {hero.headline || `${brand.storeName} Essentials Are Here`}
          </h1>

          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/90 drop-shadow-[0_5px_18px_rgba(0,0,0,0.45)] sm:text-base">
            {hero.subheadline ||
              `Discover premium collections from ${brand.storeName}`}
          </p>

          <div className="mt-5 flex w-full max-w-xl flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={hero.primaryCtaLink || "/shop"}
              style={{ backgroundColor: brand.primaryColor }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-md px-5 py-0 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_55px_rgba(199,75,33,0.26)] transition hover:brightness-110 sm:px-7"
            >
              {hero.primaryCtaLabel || "Shop Winter Collection"}
            </Link>

            <Link
              href={hero.secondaryCtaLink || "/lookbook"}
              className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/85 bg-transparent px-5 py-0 text-xs font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:bg-white hover:text-black sm:px-7"
            >
              {hero.secondaryCtaLabel || "View Lookbook"}
            </Link>
          </div>
        </div>
      </div>

      {heroes.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 sm:bottom-8">
          {heroes.map((item, index) => (
            <button
              key={item.id || index}
              type="button"
              onClick={() => setActive(index)}
              className={[
                "grid h-11 w-11 touch-manipulation place-items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                index === active ? "opacity-100" : "opacity-65 hover:opacity-100",
              ].join(" ")}
              aria-label={`Hero ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
            ><span className={`block h-2.5 rounded-full bg-white transition-all ${index === active ? "w-6" : "w-2.5"}`} /></button>
          ))}
        </div>
      ) : null}
    </section>
  );
}



