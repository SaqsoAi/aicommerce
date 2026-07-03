const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const authHeaders = (): HeadersInit => {
  const headers = new Headers();

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
};
export type ClientNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userId?: string | null;
  createdAt: string;
};

const readJson = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  return data?.data ?? data;
};

export const getClientNotifications = async (): Promise<ClientNotification[]> => {
  const res = await fetch(`${API}/notifications`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await readJson(res);
  return Array.isArray(data) ? data : [];
};

export const getClientNotificationHistory = async (): Promise<ClientNotification[]> => {
  const res = await fetch(`${API}/notifications/history`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await readJson(res);
  return Array.isArray(data) ? data : [];
};

export const getClientUnreadNotificationCount = async (): Promise<number> => {
  const res = await fetch(`${API}/notifications/unread-count`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await readJson(res);
  return Number(data?.count ?? 0);
};

export const markClientNotificationRead = async (id: string) => {
  const res = await fetch(`${API}/notifications/read/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return readJson(res);
};

export const markAllClientNotificationsRead = async () => {
  const res = await fetch(`${API}/notifications/read-all`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return readJson(res);
};