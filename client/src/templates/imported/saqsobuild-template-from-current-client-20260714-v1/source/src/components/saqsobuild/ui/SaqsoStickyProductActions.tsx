"use client";

type SaqsoStickyProductActionsProps = {
  price?: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
};

export default function SaqsoStickyProductActions({ price, onAddToCart, onBuyNow }: SaqsoStickyProductActionsProps) {
  return (
    <div className="saqso-sticky-product-actions" aria-label="Product purchase actions">
      <div className="saqso-sticky-product-price">{price || "Select product"}</div>
      <button type="button" className="saqso-btn saqso-btn-ghost" onClick={onAddToCart}>Add To Cart</button>
      <button type="button" className="saqso-btn saqso-btn-primary" onClick={onBuyNow}>Buy Now</button>
    </div>
  );
}