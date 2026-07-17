const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Product engine request failed");
  }

  return data?.data ?? data;
}

export function getProductEngine(productId: string) {
  return request(`/product-engine/${productId}`);
}

export function saveProductSeo(productId: string, payload: unknown) {
  return request(`/product-engine/${productId}/seo`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function saveProductAiMeta(productId: string, payload: unknown) {
  return request(`/product-engine/${productId}/ai-meta`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}