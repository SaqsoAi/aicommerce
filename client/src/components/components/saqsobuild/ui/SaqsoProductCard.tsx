import Image from "next/image";
import Link from "next/link";
import { SaqsoBadge } from "./SaqsoBadge";
import { SaqsoButton } from "./SaqsoButton";

export type SaqsoProductCardProduct = {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  price?: string | number | null;
  compareAtPrice?: string | number | null;
  badge?: string | null;
  href?: string;
};

type SaqsoProductCardProps = {
  product: SaqsoProductCardProduct;
  onAddToCart?: (product: SaqsoProductCardProduct) => void;
  onWishlist?: (product: SaqsoProductCardProduct) => void;
  className?: string;
};

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  return typeof value === "number" ? value.toLocaleString("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }) : value;
}

export function SaqsoProductCard({ product, onAddToCart, onWishlist, className = "" }: SaqsoProductCardProps) {
  const href = product.href || `/product/${product.slug || product.id}`;
  const price = formatValue(product.price);
  const compareAtPrice = formatValue(product.compareAtPrice);

  return (
    <article className={["saqso-product-card", className].filter(Boolean).join(" ")}>
      <Link href={href} className="saqso-product-card__media" aria-label={product.name}>
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 48vw, (max-width: 1200px) 25vw, 320px" />
        ) : (
          <span className="saqso-product-card__placeholder">SAQSO</span>
        )}
        {product.badge ? <SaqsoBadge tone="premium" className="saqso-product-card__badge">{product.badge}</SaqsoBadge> : null}
      </Link>
      <div className="saqso-product-card__body">
        <Link href={href} className="saqso-product-card__title">{product.name}</Link>
        <div className="saqso-product-card__price-row">
          {price ? <strong>{price}</strong> : null}
          {compareAtPrice ? <span>{compareAtPrice}</span> : null}
        </div>
        <div className="saqso-product-card__actions">
          {onAddToCart ? <SaqsoButton type="button" size="sm" fullWidth onClick={() => onAddToCart(product)}>Add to cart</SaqsoButton> : null}
          {onWishlist ? <button type="button" className="saqso-product-card__wish" onClick={() => onWishlist(product)} aria-label={`Add ${product.name} to wishlist`}>â™¡</button> : null}
        </div>
      </div>
    </article>
  );
}