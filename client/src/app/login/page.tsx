"use client";

import AuthModal from "@/components/auth/modal/AuthModal";
import { useBrand } from "@/providers/BrandProvider";

export default function LoginPage() {
  const { brand } = useBrand();
  const storeName = String(brand.storeName || "ISRA LIFESTYLE").toUpperCase();

  return (
    <main className="min-h-[var(--ai-hero-viewport)] bg-[#050505] text-white">
      <section className="mx-auto flex min-h-[var(--ai-hero-viewport)] w-full max-w-[440px] items-center px-4 py-8">
        <div className="w-full">
          <div className="mb-7 inline-flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
            {brand.appIconUrl ? (
              <img src={brand.appIconUrl} alt="icon" className="h-8 w-8 object-contain" />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-black text-xs font-black">IS</span>
            )}
            <div>
              <p className="text-sm font-black leading-none">{storeName}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-white/55">Secure Login</p>
            </div>
          </div>

          <AuthModal initialMode="login" />
        </div>
      </section>
    </main>
  );
}
