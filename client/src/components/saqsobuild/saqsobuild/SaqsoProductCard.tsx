import Link from "next/link";
import { SaqsoBadge } from "./SaqsoBuildPrimitives";

export type SaqsoProductCardProps = {
  id: string;
  name: string;
  image?: string | null;
  price?: string | number | null;
  badge?: string | null;
  href?: string;
};

export function SaqsoProductCard({ id, name, image, price, badge, href }: SaqsoProductCardProps) {
  const target = href || `/product/${id}`;
  return (
    <article className="saqso-product-card">
      <Link href={target} className="saqso-product-media" aria-label={name}>
        {image ? <img src={image} alt={name} loading="lazy" /> : <div className="saqso-product-placeholder" aria-hidden="true" />}
        {badge ? <SaqsoBadge className="saqso-product-badge">{badge}</SaqsoBadge> : null}
      </Link>
      <div className="saqso-product-info">
        <Link href={target} className="saqso-product-title">{name}</Link>
        {price !== null && price !== undefined ? <p className="saqso-product-price">{price}</p> : null}
      </div>
    </article>
  );
}