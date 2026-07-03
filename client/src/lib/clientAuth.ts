export type StoredUser = Record<string, unknown> | null;

export function getClientToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("customerToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

export function getClientUser(): StoredUser {
  if (typeof window === "undefined") return null;

  const raw =
    localStorage.getItem("user") ||
    localStorage.getItem("customer") ||
    localStorage.getItem("authUser");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveClientAuth(input: {
  token?: string;
  accessToken?: string;
  customerToken?: string;
  user?: unknown;
}) {
  if (typeof window === "undefined") return;

  const token = input.token || input.accessToken || input.customerToken || "";

  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("customerToken", token);
    localStorage.setItem("authToken", token);
  }

  if (input.user) {
    const value = JSON.stringify(input.user);
    localStorage.setItem("user", value);
    localStorage.setItem("customer", value);
    localStorage.setItem("authUser", value);
  }

  window.dispatchEvent(new Event("ai-commerce-auth-updated"));
}

export function clearClientAuth() {
  if (typeof window === "undefined") return;

  [
    "token",
    "accessToken",
    "customerToken",
    "authToken",
    "user",
    "customer",
    "authUser",
  ].forEach((key) => localStorage.removeItem(key));

  window.dispatchEvent(new Event("ai-commerce-auth-updated"));
}