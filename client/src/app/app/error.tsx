"use client";

import BrandStateScreen from "@/components/brand/BrandStateScreen";

export default function ErrorPage() {
  return (
    <BrandStateScreen
      title="Something went wrong"
      subtitle="Please refresh or return to the shop."
      ctaLabel="Back to Shop"
      ctaHref="/shop"
    />
  );
}