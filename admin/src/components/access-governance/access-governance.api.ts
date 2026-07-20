"use client";

export const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export type Permission = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
};

export type Role = {
  id: string;
  name: string;
  description?: string | null;
  permissionCodes: string[];
};

export type Store = {
  id: string;
  name: string;
  status: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  stores: Store[];
};

export type AccessCatalog = {
  userRoles: string[];
  roles: Role[];
  permissions: Permission[];
  tenants: Tenant[];
};

export function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? (
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("admin_token") ||
          localStorage.getItem("authToken")
        )
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function accessRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API}/super-admin${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...authHeaders(),
      ...(init?.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      body?.message ||
        body?.error?.message ||
        `Request failed: ${response.status}`,
    );
  }
  return (body?.data ?? body) as T;
}

export const panelStyle: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,.20)",
  background: "rgba(15,23,42,.78)",
  borderRadius: 16,
  padding: 18,
};

export const fieldStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  border: "1px solid rgba(148,163,184,.26)",
  borderRadius: 10,
  background: "#08111f",
  color: "#eef6ff",
  padding: "10px 12px",
};

export const buttonStyle: React.CSSProperties = {
  minHeight: 42,
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,.28)",
  background: "#111c2f",
  color: "#eef6ff",
  padding: "8px 14px",
  fontWeight: 800,
  cursor: "pointer",
};
