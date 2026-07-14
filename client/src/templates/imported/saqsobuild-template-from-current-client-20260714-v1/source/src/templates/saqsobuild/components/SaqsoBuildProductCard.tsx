"use client";

type Product = {
  id?: string | number;
  name?: string;
  title?: string;
  price?: number | string;
  salePrice?: number | string;
  image?: string;
  imageUrl?: string;
  category?: string;
  badge?: string;
};

type SaqsoBuildProductCardProps = {
  product: Product;
  currency?: string;
};

function formatPrice(value: Product["price"], currency: string) {
  if (value === undefined || value === null || value === "") return "Price unavailable";
  if (typeof value === "number") return `${currency} ${value.toLocaleString("en-BD")}`;
  return `${currency} ${value}`;
}

export default function SaqsoBuildProductCard({ product, currency = "BDT" }: SaqsoBuildProductCardProps) {
  const title = product.name || product.title || "Product";
  const image = product.imageUrl || product.image;
  return (
    <article className="saqso-product-card">
      <div className="saqso-product-media">
        {image ? <img src={image} alt={title} loading="lazy" /> : <div className="saqso-product-media-empty">No image</div>}
        {product.badge ? <span className="saqso-product-badge">{product.badge}</span> : null}
      </div>
      <div className="saqso-product-body">
        {product.category ? <span className="saqso-product-category">{product.category}</span> : null}
        <h3>{title}</h3>
        <div className="saqso-product-price-row">
          <strong>{formatPrice(product.salePrice || product.price, currency)}</strong>
          {product.salePrice && product.price ? <span>{formatPrice(product.price, currency)}</span> : null}
        </div>
      </div>
    </article>
  );
}