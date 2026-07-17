const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const headers = (): HeadersInit => {
  const h = new Headers();
  h.set("Content-Type", "application/json");
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) h.set("Authorization", `Bearer ${token}`);
  }
  return h;
};

const readJson = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  return data?.data ?? data;
};

export const getOmnichannelHealth = async () =>
  readJson(await fetch(`${API}/omnichannel/health`, { headers: headers(), cache: "no-store" }));

export const getOmnichannelAnalytics = async () =>
  readJson(await fetch(`${API}/omnichannel/analytics`, { headers: headers(), cache: "no-store" }));

export const getOmnichannelTimeline = async () =>
  readJson(await fetch(`${API}/omnichannel/timeline`, { headers: headers(), cache: "no-store" }));

export const routeOmnichannelMessage = async (payload: any) =>
  readJson(await fetch(`${API}/omnichannel/route`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  }));
