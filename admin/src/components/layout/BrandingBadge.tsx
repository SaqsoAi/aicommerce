"use client";

import { useBranding } from "@/lib/branding/useBranding";

export default function BrandingBadge() {
  const branding = useBranding();

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black">
        {branding.brandShortName || "SQ"}
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          {branding.brandSlogan || "Enterprise Commerce"}
        </p>

        <h3 className="font-bold">
          {branding.brandName || "SAQSO"}
        </h3>
      </div>
    </div>
  );
}
