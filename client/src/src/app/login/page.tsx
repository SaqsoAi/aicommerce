"use client";

import AuthModal from "@/components/auth/modal/AuthModal";
import { useBrand } from "@/providers/BrandProvider";

export default function LoginPage() {
  const { brand } = useBrand();
  const storeName = String(brand.storeName || "ISRA LIFESTYLE").toUpperCase();

  return (
    <main className="min-h-screen bg-[#050505] pt-[var(--ai-header-h-mobile)] text-white sm:pt-[var(--ai-header-h-tablet)] lg:pt-[var(--ai-header-h-desktop)]">
      <section className="mx-auto flex min-h-[calc(100svh-var(--ai-header-h-mobile))] w-full max-w-[440px] items-center px-4 py-8">
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
