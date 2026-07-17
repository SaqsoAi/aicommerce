const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

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

export const getNotificationProviders = async () => {
  const res = await fetch(`${API}/notification-providers`, {
    headers: headers(),
    cache: "no-store",
  });
  return readJson(res);
};

export const getNotificationProviderHealth = async () => {
  const res = await fetch(`${API}/notification-providers/health`, {
    headers: headers(),
    cache: "no-store",
  });
  return readJson(res);
};

export const saveNotificationProvider = async (payload: any) => {
  const res = await fetch(`${API}/notification-providers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  return readJson(res);
};

export const sendTestEmail = async (to: string) => {
  const res = await fetch(`${API}/notification-providers/test-email`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ to }),
  });
  return readJson(res);
};

export const sendTestPush = async (receiver: string) => {
  const res = await fetch(`${API}/notification-providers/test-push`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ receiver }),
  });
  return readJson(res);
};
