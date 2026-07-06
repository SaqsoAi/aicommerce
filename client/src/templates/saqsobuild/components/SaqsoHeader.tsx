<<<<<<< HEAD
﻿// PHASE_3_2_TOP_RISK_HARDENED
=======
// PHASE_3_2_TOP_RISK_HARDENED
>>>>>>> 88db37a (feat(phase-3): enterprise design system and responsive UX hardening)
/* PHASE_3_1_RESPONSIVE_GUARD */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import SaqsoThemeToggle from "./SaqsoThemeToggle";
import { useBrand } from "@/providers/BrandProvider";

const nav = [
  { label: "Home", href: "/", desc: "Premium homepage" },
  { label: "Shop", href: "/shop", desc: "All products" },
  { label: "Lookbook", href: "/lookbook", desc: "Style stories" },
  { label: "Try-On", href: "/virtual-tryon", desc: "AI fitting room" },
];

function HeaderLogo() {
  const { brand } = useBrand();

  const storeName = String(brand.storeName || brand.raw?.storeName || "ISRA").trim();
  const slogan = String(brand.raw?.slogan || brand.raw?.tagline || "").trim();

  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-black/45 ring-1 ring-white/15 shadow-[0_10px_26px_rgba(0,0,0,.42)] sm:h-[58px] sm:w-[58px] sm:rounded-[16px]">
        {brand.appIconUrl ? (
          <img
            src={brand.appIconUrl}
            alt={`${storeName} icon`}
            className="h-8 w-8 object-contain object-center sm:h-[44px] sm:w-[44px]"
          />
        ) : (
          <span className="font-serif text-sm font-black text-white sm:text-lg">IS</span>
        )}
      </span>

      <span className="hidden h-12 w-px bg-gradient-to-b from-transparent via-white/35 to-transparent sm:block" />

      <span className="flex w-[118px] min-w-0 flex-col items-start justify-center overflow-visible sm:w-[230px]">
        <span className="flex h-[29px] w-[118px] items-center overflow-visible sm:h-[42px] sm:w-[230px]">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={`${storeName} logo`}
              className="h-[25px] w-auto max-w-[118px] object-contain object-left drop-shadow-[0_8px_20px_rgba(255,255,255,.14)] [image-rendering:-webkit-optimize-contrast] sm:h-[38px] sm:max-w-[230px]"
            />
          ) : (
            <span className="block truncate font-serif text-[28px] font-black uppercase leading-none tracking-[0.02em] text-white sm:text-[42px]">
              {storeName}
            </span>
          )}
        </span>

        {slogan ? (
          <span className="mt-[2px] flex w-[118px] items-center justify-center gap-1.5 overflow-hidden sm:mt-[3px] sm:w-[230px] sm:gap-3">
            <span className="h-px flex-1 bg-white/70" />
            <span className="shrink-0 truncate text-[7px] font-black uppercase leading-none tracking-[0.22em] text-white/90 sm:text-[11px] sm:tracking-[0.42em]">
              {slogan}
            </span>
            <span className="h-px flex-1 bg-white/70" />
          </span>
        ) : null}
      </span>
    </div>
  );
}

export default function SaqsoHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
<<<<<<< HEAD
      <header data-saqso-mobile-header="true" className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#030303]/95 shadow-[0_22px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl">
=======
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#030303]/95 shadow-[0_22px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl">
>>>>>>> 88db37a (feat(phase-3): enterprise design system and responsive UX hardening)
        <div className="mx-auto flex h-[var(--ai-header-h-mobile)] max-w-[1680px] items-center justify-between gap-2 px-3 sm:h-[var(--ai-header-h-tablet)] sm:px-5 lg:h-[var(--ai-header-h-desktop)] lg:px-14 enterprise-mobile-stack">
          <Link href="/" onClick={() => setMobileOpen(false)} className="min-w-0 shrink-0">
            <HeaderLogo />
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] p-2 text-sm font-black text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_18px_44px_rgba(0,0,0,.35)] backdrop-blur-xl lg:flex transition-colors duration-200 motion-reduce:transition-none">
            {nav.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-6 py-3 transition hover:bg-white hover:text-black",
                  index === 0 ? "text-amber-300" : "",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/shop" className="hidden items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-[.18em] text-black shadow-2xl transition hover:-translate-y-0.5 xl:flex">
              <Sparkles size={16} /> Shop
            </Link>

            <Link href="/shop?search=" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-white shadow-lg transition hover:bg-white hover:text-black sm:h-11 sm:w-11 transition-colors duration-200 motion-reduce:transition-none" aria-label="Search">
              <Search size={18} />
            </Link>

            <Link href="/wishlist" className="hidden h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-white shadow-lg transition hover:bg-white hover:text-black md:grid transition-colors duration-200 motion-reduce:transition-none" aria-label="Wishlist">
              <Heart size={19} />
            </Link>

            <Link href="/account" className="hidden h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-white shadow-lg transition hover:bg-white hover:text-black sm:grid transition-colors duration-200 motion-reduce:transition-none" aria-label="Account">
              <UserRound size={19} />
            </Link>

            <Link href="/cart" className="grid h-10 w-10 place-items-center rounded-full bg-white text-black shadow-xl transition hover:-translate-y-0.5 sm:h-11 sm:w-11" aria-label="Cart">
              <ShoppingBag size={18} />
            </Link>

            <span className="hidden sm:inline-flex">
              <SaqsoThemeToggle />
            </span>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-white shadow-lg lg:hidden transition-colors duration-200 motion-reduce:transition-none"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-[80] bg-black/40 backdrop-blur-md transition lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={[
          "fixed bottom-0 right-0 top-0 z-[90] w-[86vw] max-w-[380px] border-l border-white/10 bg-black/72 p-5 text-white shadow-[0_24px_90px_rgba(0,0,0,.65)] backdrop-blur-2xl transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3 enterprise-mobile-stack">
          <HeaderLogo />

          <button type="button" onClick={() => setMobileOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 transition-colors duration-200 motion-reduce:transition-none" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="mt-7 grid gap-3.5">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-[1.35rem] border border-white/12 bg-white/[0.075] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_14px_34px_rgba(0,0,0,.28)] backdrop-blur-xl transition hover:bg-white/[0.11] transition-colors duration-200 motion-reduce:transition-none">
              <span className="block text-lg font-black">{item.label}</span>
              <span className="mt-1 block text-xs font-bold text-white/50">{item.desc}</span>
            </Link>
          ))}
        </div>

        <div className="mt-6 enterprise-responsive-guard grid grid-cols-2 gap-3.5 enterprise-mobile-stack">
          <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="rounded-full bg-white/95 px-4 py-4 shadow-[0_12px_32px_rgba(255,255,255,.12)] text-center text-xs font-black uppercase tracking-[.16em] text-black">
            Wishlist
          </Link>
          <Link href="/account" onClick={() => setMobileOpen(false)} className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-4 backdrop-blur-xl text-center text-xs font-black uppercase tracking-[.16em] transition-colors duration-200 motion-reduce:transition-none">
            Account
          </Link>
        </div>
      </aside>
    </>
  );
}



