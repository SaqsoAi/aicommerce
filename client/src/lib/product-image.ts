import { normalizeImageUrl } from "./normalizeImageUrl";

export function getProductImage(product: any) {
  const raw =
    product?.thumbnail ||
    product?.image ||
    product?.imageUrl ||
    product?.coverImage ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    "/placeholder-product.jpg";

  return normalizeImageUrl(raw);
}
