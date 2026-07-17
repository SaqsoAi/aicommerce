"use client";

import Link from "next/link";
import { useBrand } from "@/providers/BrandProvider";

type Props = {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function BrandStateScreen({
  title,
  subtitle,
  ctaLabel = "Back to Shop",
  ctaHref = "/shop",
}: Props) {
  const { brand } = useBrand();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 text-zinc-950 dark:bg-black dark:text-white">
      <section className="w-full max-w-xl rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.045]">
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt={brand.storeName} className="mx-auto h-16 w-16 rounded-2xl bg-white object-contain p-2" />
        ) : null}

        <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-zinc-500">
          {brand.storeName}
        </p>

        <h1 className="mt-3 text-4xl font-black">{title}</h1>

        {subtitle ? (
          <p className="mt-3 text-sm font-semibold text-zinc-500">{subtitle}</p>
        ) : null}

        <Link
          href={ctaHref}
          style={{ backgroundColor: brand.primaryColor }}
          className="mt-6 inline-flex rounded-2xl px-6 py-3 text-sm font-black text-white"
        >
          {ctaLabel}
        </Link>
      </section>
    </main>
  );
}