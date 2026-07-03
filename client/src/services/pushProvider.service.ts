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

export const requestPushPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "UNSUPPORTED";
  }

  return Notification.requestPermission();
};

export const queueTestClientPush = async (receiver: string) => {
  const res = await fetch(`${API}/notification-providers/test-push`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ receiver }),
  });

  return res.json().catch(() => ({}));
};
