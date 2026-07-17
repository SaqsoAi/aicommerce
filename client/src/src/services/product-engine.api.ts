const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000/api";

export async function getProductEngine(productId: string) {
  const response = await fetch(`${API_BASE}/product-engine/${productId}`, {
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Failed to load product engine");
  }

  return data?.data ?? data;
}