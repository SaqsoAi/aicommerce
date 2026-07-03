"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Truck, Globe, MessageCircle, Share2 } from "lucide-react";
import { useBrand } from "@/providers/BrandProvider";

const columns = [
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

export default function SaqsoFooterPremium() {
  const { brand } = useBrand();
  const footerLogo = brand.footerLogoUrl || brand.logoUrl;
  const initials = (brand.shortName || brand.storeName || "SQ").slice(0, 2).toUpperCase();
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white dark:border-white/10 dark:bg-black">
      <div className="mx-auto max-w-[1680px] w-full px-4 py-14 sm:px-6 lg:px-4 sm:px-6 lg:px-10 lg:py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-sm font-black text-white shadow-2xl">
                SQ
              </span>
              <span>
                <span className="block text-3xl font-black tracking-[-.08em]">{brand.storeName}</span>
                <span className="block text-[10px] font-black uppercase tracking-[.3em] text-white/40">AI Commerce</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-sm font-semibold leading-7 text-white/55">
              Premium AI-powered commerce experience with smart search, recommendations, virtual try-on and responsive luxury design.
            </p>

            <div className="mt-6 flex gap-3">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <a key={i} href="#" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/10 transition hover:-translate-y-1 hover:bg-white/20">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
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

        <div className="mt-12 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Truck size={22} className="text-amber-300" />
            <span className="text-xs font-black uppercase tracking-[.16em] text-white/70">Fast Delivery</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <ShieldCheck size={22} className="text-amber-300" />
            <span className="text-xs font-black uppercase tracking-[.16em] text-white/70">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Mail size={22} className="text-amber-300" />
            <span className="text-xs font-black uppercase tracking-[.16em] text-white/70">Premium Support</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-xs font-bold text-white/40 md:flex-row md:items-center">
          <p>Â© {new Date().getFullYear()} {brand.storeName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2"><MapPin size={14} /> {brand.address || "Bangladesh"}</span>
            <span className="inline-flex items-center gap-2"><Phone size={14} /> {brand.contactPhone || "Support Ready"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

