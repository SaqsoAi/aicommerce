import {
  normalizeUserRole,
  roleLabel,
  ROLE_LANDING_ROUTES,
  type AdminAppRole,
  type UserRole,
} from "@/config/roles";

export type AdminSessionUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: unknown;
  permissions?: unknown;
  tenantId?: string | null;
  storeId?: string | null;
};

export type AdminSessionSnapshot = {
  token: string | null;
  user: AdminSessionUser | null;
  role: UserRole;
  permissions: string[];
  authenticated: boolean;
};

export const ADMIN_PUBLIC_PATHS = ["/login"] as const;

export function isPublicAdminPath(pathname: string): boolean {
  return ADMIN_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function parseUser(raw: string | null): AdminSessionUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as AdminSessionUser)
      : null;
  } catch {
    return null;
  }
}

function normalizePermissions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((entry) => String(entry).trim()).filter(Boolean))];
}

export function readAdminSession(): AdminSessionSnapshot {
  if (typeof window === "undefined") {
    return {
      token: null,
      user: null,
      role: "MANAGER",
      permissions: [],
      authenticated: false,
    };
  }

  const token =
    localStorage.getItem("token") ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("authToken");

  const user =
    parseUser(localStorage.getItem("user")) ??
    parseUser(localStorage.getItem("adminUser")) ??
    parseUser(localStorage.getItem("admin"));

  const role = normalizeUserRole(
    user?.role ??
      localStorage.getItem("role") ??
      localStorage.getItem("userRole"),
  );

  return {
    token,
    user,
    role,
    permissions: normalizePermissions(user?.permissions),
    authenticated: Boolean(token),
  };
}

export function defaultAdminRoute(role: unknown): string {
  return ROLE_LANDING_ROUTES[normalizeUserRole(role)];
}

export function adminRoleDisplayName(role: unknown): string {
  return roleLabel(role);
}

export function isAdminApplicationRole(role: unknown): role is AdminAppRole {
  return normalizeUserRole(role) !== "CUSTOMER";
}

export function dispatchAdminSessionChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("auth:changed"));
  window.dispatchEvent(new Event("role:changed"));
}

export function subscribeAdminSession(
  listener: (snapshot: AdminSessionSnapshot) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const refresh = () => listener(readAdminSession());
  window.addEventListener("storage", refresh);
  window.addEventListener("auth:changed", refresh);
  window.addEventListener("role:changed", refresh);
  window.addEventListener("focus", refresh);

  return () => {
    window.removeEventListener("storage", refresh);
    window.removeEventListener("auth:changed", refresh);
    window.removeEventListener("role:changed", refresh);
    window.removeEventListener("focus", refresh);
  };
}
