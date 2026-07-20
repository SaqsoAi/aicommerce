"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Mail, MapPin, Phone, ShieldCheck, Truck, Globe, MessageCircle, Share2 } from "lucide-react";
import { useBrand } from "@/providers/BrandProvider";

const defaultColumns: Array<{ title: string; links: Array<[string, string]> }> = [
  {
    title: "Shop",
    links: [
      ["New Arrivals", "/shop"],
      ["Best Sellers", "/shop"],
      ["Lookbook", "/lookbook"],
      ["Virtual Try-On", "/virtual-tryon"],
    ],
  },
  {
    title: "Account",
    links: [
      ["My Account", "/account"],
      ["Orders", "/orders"],
      ["Wishlist", "/wishlist"],
      ["Rewards", "/dashboard/rewards"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Size Fit Center", "/size-fit-center"],
      ["Track Order", "/track-order"],
      ["Returns", "/dashboard/returns"],
      ["Refunds", "/dashboard/refunds"],
    ],
  },
];

type FooterColumn = { title: string; links: [string, string][] };

function parseFooterNavigation(value: string | undefined): FooterColumn[] {
  if (!value) return defaultColumns;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return defaultColumns;
    const valid = parsed.filter((column): column is FooterColumn => Boolean(column && typeof column.title === "string" && Array.isArray(column.links))).map((column) => ({ ...column, links: column.links.filter((link) => Array.isArray(link) && typeof link[0] === "string" && typeof link[1] === "string" && link[1].startsWith("/")).slice(0, 8) })).filter((column) => column.links.length);
    return valid.length ? valid.slice(0, 4) : defaultColumns;
  } catch {
    return defaultColumns;
  }
}

export default function SaqsoFooterPremium() {
  const { brand } = useBrand();
  const columns = useMemo(() => parseFooterNavigation(brand.raw.footerNavigation), [brand.raw.footerNavigation]);
  const socialLinks = [{ href: brand.website, label: "Website", icon: Globe }, { href: brand.contactPhone ? `tel:${brand.contactPhone}` : "", label: "Call support", icon: MessageCircle }, { href: brand.socials.facebook || brand.socials.instagram, label: "Social profile", icon: Share2 }].filter((item) => item.href);
  const footerLogo = brand.footerLogoUrl || brand.logoUrl;
  const initials = (brand.shortName || brand.storeName || "SQ").slice(0, 2).toUpperCase();
  return (
    <footer className="border-t border-white/10 bg-black pb-[calc(var(--ai-bottom-nav-h)+env(safe-area-inset-bottom))] text-white md:pb-0">
      <div className="mx-auto w-full max-w-[1680px] px-5 py-10 sm:px-7 sm:py-14 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-10">
          <div>
            <Link href="/" className="inline-flex max-w-full items-center gap-3">
              <span className="grid h-12 w-24 min-w-0 shrink-0 place-items-center overflow-hidden bg-transparent text-sm font-black text-white">{footerLogo ? <img src={footerLogo} alt={`${brand.storeName} logo`} className="h-full w-full object-contain object-left" /> : initials}</span>
              <span>
                <span className="block text-3xl font-black tracking-[-.08em]">{brand.storeName}</span>
                <span className="block text-[10px] font-black uppercase tracking-[.3em] text-white/40">AI Commerce</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-sm font-semibold leading-7 text-white/55">
              {brand.raw.footerText || brand.description || "Premium AI-powered commerce experience with smart search, recommendations and virtual try-on."}
            </p>

            <div className="mt-6 flex gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} aria-label={item.label} className="grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-white/10 transition hover:bg-white/20"><Icon size={18} /></a>;
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:contents">
          {columns.map((col) => (
            <div key={col.title} className="min-w-0">
              <h3 className="text-xs font-black uppercase tracking-[.3em] text-amber-300">{col.title}</h3>
              <div className="mt-5 grid gap-3">
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} className="text-sm font-bold text-white/55 transition hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>

        <div className="mt-10 grid gap-3 border-t border-white/10 pt-7 sm:grid-cols-3 lg:mt-12 lg:gap-4 lg:pt-8">
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-4">
            <Truck size={22} className="text-amber-300" />
            <span className="text-xs font-black uppercase tracking-[.16em] text-white/70">Fast Delivery</span>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-4">
            <ShieldCheck size={22} className="text-amber-300" />
            <span className="text-xs font-black uppercase tracking-[.16em] text-white/70">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-4">
            <Mail size={22} className="text-amber-300" />
            <span className="text-xs font-black uppercase tracking-[.16em] text-white/70">Premium Support</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-xs font-bold text-white/40 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {brand.storeName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2"><MapPin size={14} /> {brand.address || "Bangladesh"}</span>
            <span className="inline-flex items-center gap-2"><Phone size={14} /> {brand.contactPhone || "Support Ready"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}



