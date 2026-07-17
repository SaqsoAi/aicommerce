export type AdminRoleTheme = "super-admin" | "admin" | "user-admin";

export function normalizeRoleTheme(role?: string | null): AdminRoleTheme {
  const value = String(role || "").trim().toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
  if (value.includes("super")) return "super-admin";
  if (value === "admin" || value.includes("administrator")) return "admin";
  if (value.includes("user-admin") || value.includes("manager") || value.includes("staff")) return "user-admin";
  return "super-admin";
}

export function readStoredUserRole(): string {
  if (typeof window === "undefined") return "SUPER_ADMIN";

  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw) as { role?: string };
      if (user.role) return user.role;
    }
  } catch {}

  return (
    localStorage.getItem("admin-role") ||
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    localStorage.getItem("user-role") ||
    sessionStorage.getItem("role") ||
    "SUPER_ADMIN"
  );
}

export function getRoleThemeFromBrowser(): AdminRoleTheme {
  return normalizeRoleTheme(readStoredUserRole());
}
