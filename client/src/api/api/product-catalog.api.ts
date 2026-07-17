const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function parseResponse(res: Response) {
  const json = await res.json();

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "Product catalog request failed");
  }

  return json.data;
}

export async function getProductCatalogFilters() {
  const res = await fetch(`${API_URL}/product-catalog/filters`, {
    cache: "no-store",
  });

  return parseResponse(res);
}

export async function getProductCatalogProducts(params?: Record<string, string>) {
  const query = new URLSearchParams(params || {});
  const res = await fetch(`${API_URL}/product-catalog/products?${query.toString()}`, {
    cache: "no-store",
  });

  return parseResponse(res);
}

export async function getProductCatalogStylistPicks() {
  const res = await fetch(`${API_URL}/product-catalog/stylist-picks`, {
    cache: "no-store",
  });

  return parseResponse(res);
}

export async function getProductCatalogRecommended() {
  const res = await fetch(`${API_URL}/product-catalog/recommended`, {
    cache: "no-store",
  });

  return parseResponse(res);
}