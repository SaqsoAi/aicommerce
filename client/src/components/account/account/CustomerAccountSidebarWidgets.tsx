"use client";

import Link from "next/link";
import { Crown, Headphones } from "lucide-react";

export default function CustomerAccountSidebarWidgets() {
  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-white">
        <div className="flex items-center gap-2 text-amber-200">
          <Crown className="h-4 w-4" />
          <p className="text-sm font-black">ISRA Member</p>
        </div>
        <p className="mt-2 text-xs font-bold text-white/75">
          You are a Gold Member
        </p>
        <p className="mt-1 text-[11px] text-white/45">
          Enjoy exclusive perks & rewards.
        </p>
        <Link
          href="/dashboard"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:brightness-110"
        >
          View Benefits
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-white/70" />
          <p className="text-sm font-black">Need Help?</p>
        </div>
        <p className="mt-2 text-xs text-white/50">
          We are here to help you.
        </p>
        <a
          href="mailto:support@stylehub.com?subject=Customer%20Support"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white/10"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}