"use client";

import { useState } from "react";
import { getProductImage } from "@/lib/product-image";

type Props = {
  source: unknown;
  alt: string;
  className?: string;
};

export default function SafeProductImage({ source, alt, className }: Props) {
  const [failed, setFailed] = useState(false);
  const src = failed ? "/placeholder-product.svg" : getProductImage(source);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
