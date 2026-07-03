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
    throw new Error(data?.message || "AI Control request failed");
  }

  return data?.data ?? data;
}

export function seedAiControl() {
  return request("/ai-control/seed", { method: "POST" });
}

export function getAiDashboard() {
  return request("/ai-control/dashboard");
}

export function updateAiFeature(key: string, payload: unknown) {
  return request(`/ai-control/features/${key}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateAiProvider(key: string, payload: unknown) {
  return request(`/ai-control/providers/${key}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function createAiOverride(payload: unknown) {
  return request("/ai-control/overrides", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}