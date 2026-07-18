import { normalizeImageUrl } from "./normalizeImageUrl";

export function getProductImage(product: any) {
  const raw =
    product?.thumbnail ||
    product?.thumbnailUrl ||
    product?.image ||
    product?.imageUrl ||
    product?.url ||
    product?.coverImage ||
    product?.featuredImage ||
    product?.variant?.image ||
    product?.variant?.imageUrl ||
    product?.variant?.images?.[0]?.url ||
    product?.variant?.images?.[0] ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    product?.gallery?.[0]?.url ||
    product?.gallery?.[0] ||
    product?.media?.[0]?.url ||
    product?.media?.[0] ||
    product?.product?.thumbnail ||
    product?.product?.imageUrl ||
    product?.product?.images?.[0]?.url ||
    "/placeholder-product.jpg";

  return normalizeImageUrl(raw);
}
