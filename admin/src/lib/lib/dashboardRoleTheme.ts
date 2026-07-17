export type AdminRoleTheme = "super-admin" | "admin" | "user-admin";

export type RoleProfile = {
  role: AdminRoleTheme;
  label: string;
  subtitle: string;
  accentLabel: string;
  primary: string;
  secondary: string;
  accent: string;
};

export const ROLE_PROFILES: Record<AdminRoleTheme, RoleProfile> = {
  "super-admin": {
    role: "super-admin",
    label: "Super Admin",
    subtitle: "AI Development Copilot",
    accentLabel: "Blue / Purple",
    primary: "#00d4ff",
    secondary: "#8b5cf6",
    accent: "#22c55e"
  },
  admin: {
    role: "admin",
    label: "Admin",
    subtitle: "Commerce Operations",
    accentLabel: "Green / Cyan",
    primary: "#22c55e",
    secondary: "#06b6d4",
    accent: "#34d399"
  },
  "user-admin": {
    role: "user-admin",
    label: "User Admin",
    subtitle: "Limited Workspace",
    accentLabel: "Violet / Indigo",
    primary: "#8b5cf6",
    secondary: "#6366f1",
    accent: "#a78bfa"
  }
};

export function normalizeAdminRole(value: unknown): AdminRoleTheme {
  const raw = String(value || "").toLowerCase().replace(/_/g, "-").trim();
  if (raw.includes("super-admin") || raw.includes("super admin") || raw.includes("superadmin") || raw.includes("owner")) return "super-admin";
  if (raw.includes("user-admin") || raw.includes("user admin") || raw.includes("manager") || raw.includes("staff") || raw.includes("editor")) return "user-admin";
  if (raw.includes("admin")) return "admin";
  return "super-admin";
}

export function getCurrentAdminRoleTheme(): AdminRoleTheme {
  if (typeof window === "undefined") return "super-admin";
  try {
    const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user") || localStorage.getItem("adminUser") || sessionStorage.getItem("adminUser");
    if (userRaw) {
      const user = JSON.parse(userRaw) as { role?: string; user?: { role?: string } };
      const role = user.role || user.user?.role;
      if (role) return normalizeAdminRole(role);
    }
  } catch {}
  return normalizeAdminRole(localStorage.getItem("role") || sessionStorage.getItem("role") || "SUPER_ADMIN");
}

export function applyRoleTheme(role: AdminRoleTheme): AdminRoleTheme {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-role-theme", role);
    document.body.setAttribute("data-role-theme", role);
  }
  return role;
}