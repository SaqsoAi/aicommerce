"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, LockKeyhole, Truck, Sparkles } from "lucide-react";

type BrandState = {
  name: string;
  slogan: string;
  logo: string;
};

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const SERVER =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000";

function normalizeAsset(src?: string) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return `${SERVER}${src}`;
  return `${SERVER}/${src}`;
}

function pickSetting(data: any[], keys: string[]) {
  const found = data.find((item) => keys.includes(item?.key));
  return found?.value || found?.url || found?.src || found?.image || "";
}

export function CheckoutHero() {
  const [brand, setBrand] = useState<BrandState>({
    name: "Your Store",
    slogan: "Premium support ready",
    logo: "",
  });

  useEffect(() => {
    let active = true;

    async function loadBrand() {
      try {
        const res = await fetch(`${API}/enterprise-settings`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];

        const name =
          pickSetting(data, ["brandName", "storeName", "companyName", "name"]) ||
          "Your Store";

        const slogan =
          pickSetting(data, ["slogan", "tagline", "shortDescription"]) ||
          "Premium support ready";

        const logo =
          pickSetting(data, [
            "checkoutLogo",
            "headerLogo",
            "logo",
            "darkLogo",
            "whiteLogo",
            "mobileLogo",
          ]) || "";

        if (active) {
          setBrand({
            name,
            slogan,
            logo: normalizeAsset(logo),
          });
        }
      } catch {
        // Branding is optional; checkout must still render.
      }
    }

    loadBrand();

    return () => {
      active = false;
    };
  }, []);

  const initials = useMemo(() => {
    return brand.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [brand.name]);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-5 py-6 text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:px-8 sm:py-8 lg:px-10 dark:border-slate-200 dark:border-white/10 dark:bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white dark:text-white dark:shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,29,72,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(234,179,8,0.12),transparent_30%)]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner dark:border-slate-200 dark:border-white/10 dark:bg-white text-slate-950 dark:bg-black dark:text-white">
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={64}
                height={64}
                className="h-full w-full object-contain p-2"
                unoptimized
              />
            ) : (
              <span className="text-lg font-black tracking-[0.18em]">
                {initials || "S"}
              </span>
            )}
          </div>

          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.36em] text-rose-600 dark:text-rose-300">
              Secure checkout
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              {brand.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600 sm:text-base dark:text-white/65">
              {brand.slogan}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
          {[
            [ShieldCheck, "SSL Secure"],
            [LockKeyhole, "Safe Payment"],
            [Truck, "Fast Delivery"],
            [Sparkles, "Premium Support"],
          ].map(([Icon, label]) => {
            const Cmp = Icon as typeof ShieldCheck;
            return (
              <div
                key={label as string}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-slate-700 dark:border-slate-200 dark:border-white/10 dark:bg-white dark:bg-white/5 dark:text-white/75"
              >
                <Cmp className="mx-auto mb-2 h-4 w-4 text-rose-600 dark:text-rose-300" />
                {label as string}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CheckoutHero;

