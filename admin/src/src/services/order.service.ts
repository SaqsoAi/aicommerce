const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const authHeaders = (): Record<string, string> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getOrders = async () => {
  const res = await fetch(`${API}/orders`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  return res.json();
};

export const updateOrderStatus = async (id: string, status: string) => {
  const res = await fetch(`${API}/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      status,
    }),
  });

  return res.json();
};

export const getTimeline = async (id: string) => {
  const res = await fetch(`${API}/orders/${id}/timeline`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  return res.json();
};

export const addNote = async (id: string, note: string) => {
  const res = await fetch(`${API}/orders/${id}/note`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      note,
      createdBy: "ADMIN",
    }),
  });

  return res.json();
};

export const getOrderAnalytics = async () => {
  const res = await fetch(`${API}/orders/analytics/overview`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  return res.json();
};

export const getOrderTracking = async (id: string) => {
  const res = await fetch(`${API}/orders/${id}/tracking`, {
    cache: "no-store",
  });

  return res.json();
};
