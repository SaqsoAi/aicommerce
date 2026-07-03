const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000";

export function normalizeImageUrl(value?: string | null) {
  if (!value) return "/placeholder-product.svg";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `${SERVER_URL}${value}`;
  }

  return value;
}
