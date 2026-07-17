import prisma from "../../config/prisma";

const defaultTheme = {
  header: {
    SUPER_ADMIN: "linear-gradient(135deg,#7c3aed,#4f46e5)",
    ADMIN: "linear-gradient(135deg,#2563eb,#0f172a)",
    MANAGER: "linear-gradient(135deg,#059669,#064e3b)",
    STAFF: "linear-gradient(135deg,#475569,#020617)",
    CUSTOMER: "linear-gradient(135deg,#db2777,#7c2d12)"
  },
  sidebar: {
    background: "var(--sidebar)",
    foreground: "var(--sidebar-foreground)",
    border: "var(--sidebar-border)"
  },
  button: {
    radius: "14px",
    style: "enterprise"
  },
  card: {
    radius: "22px",
    glass: true,
    shadow: "enterprise"
  }
};

export async function getThemeSettings(scope?: string, role?: string) {
  const where: any = { active: true };

  if (scope) where.scope = scope;
  if (role) where.role = role;

  const rows = await prisma.themeSetting.findMany({
    where,
    orderBy: { updatedAt: "desc" }
  });

  if (!rows.length) {
    return {
      success: true,
      data: defaultTheme,
      source: "default"
    };
  }

  return {
    success: true,
    data: rows,
    source: "database"
  };
}

export async function upsertThemeSetting(input: {
  scope: string;
  role?: string | null;
  key: string;
  value: any;
  active?: boolean;
}) {
  const safeRole = input.role ?? null;

  const row = await prisma.themeSetting.upsert({
    where: { key: input.key },
    update: {
      scope: input.scope,
      role: safeRole,
      value: input.value,
      active: input.active ?? true
    },
    create: {
      scope: input.scope,
      role: safeRole,
      key: input.key,
      value: input.value,
      active: input.active ?? true
    }
  });

  return {
    success: true,
    data: row
  };
}
