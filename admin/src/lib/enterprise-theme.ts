export type AdminRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "STAFF"
  | "CUSTOMER";

export const enterpriseRoleTheme: Record<AdminRole, {
  label: string;
  gradient: string;
  badge: string;
  description: string;
}> = {
  SUPER_ADMIN: {
    label: "Enterprise Control Center",
    gradient: "from-violet-600 via-indigo-600 to-slate-950",
    badge: "Super Admin",
    description: "Full system, theme and commerce control"
  },
  ADMIN: {
    label: "Operations Center",
    gradient: "from-blue-600 via-sky-600 to-slate-950",
    badge: "Admin",
    description: "Store operation and catalog management"
  },
  MANAGER: {
    label: "Business Intelligence",
    gradient: "from-emerald-600 via-teal-600 to-slate-950",
    badge: "Manager",
    description: "Analytics, performance and growth control"
  },
  STAFF: {
    label: "Workspace",
    gradient: "from-slate-600 via-zinc-700 to-slate-950",
    badge: "Staff",
    description: "Daily task and order operation"
  },
  CUSTOMER: {
    label: "Customer Experience",
    gradient: "from-pink-600 via-rose-600 to-slate-950",
    badge: "Customer",
    description: "Personalized shopping workspace"
  }
};

export function getEnterpriseRoleTheme(role?: string) {
  const safeRole = (role || "SUPER_ADMIN") as AdminRole;
  return enterpriseRoleTheme[safeRole] || enterpriseRoleTheme.SUPER_ADMIN;
}
