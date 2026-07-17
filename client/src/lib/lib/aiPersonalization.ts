export type PersonalizationPayload = Record<string, unknown>;

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000/api";

async function postPersonalization<T>(path: string, payload: PersonalizationPayload): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/ai/personalization${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}

export const aiPersonalizationApi = {
  homepage: <T = unknown>(payload: PersonalizationPayload) => postPersonalization<T>("/homepage", payload),
  ranking: <T = unknown>(payload: PersonalizationPayload) => postPersonalization<T>("/ranking", payload),
  wishlist: <T = unknown>(payload: PersonalizationPayload) => postPersonalization<T>("/wishlist", payload),
  crossSell: <T = unknown>(payload: PersonalizationPayload) => postPersonalization<T>("/cross-sell", payload),
  upsell: <T = unknown>(payload: PersonalizationPayload) => postPersonalization<T>("/upsell", payload),
  preferences: <T = unknown>(payload: PersonalizationPayload) => postPersonalization<T>("/preferences", payload),
};

export default aiPersonalizationApi;
