"use client";

import { ShieldCheck } from "lucide-react";

export function CheckoutTrustPanel() {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-[#151922] px-5 py-5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:px-7">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-950/30">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">
            Secure checkout
          </p>
          <h2 className="mt-1 text-base font-black tracking-tight sm:text-xl">
            Trusted checkout with brand support
          </h2>
          <p className="mt-1 text-xs font-semibold text-white/55 sm:text-sm">
            Premium support ready
          </p>
        </div>
      </div>
    </section>
  );
}

export default CheckoutTrustPanel;
