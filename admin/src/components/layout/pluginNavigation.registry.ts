import { getTenantPluginVisibility } from "@/api/pluginPlatform.api";
import type { UserRole } from "@/config/roles";
import type { AdminNavGroup, AdminNavItem, AdminRole } from "./navigation";

const SAFE_ICON = /^[A-Za-z][A-Za-z0-9]*$/;
const SAFE_HREF = /^\/(?!\/)[A-Za-z0-9_\-./\[\]]*$/;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((entry) => text(entry)).filter(Boolean)
    : [];
}

function roleArray(value: unknown): AdminRole[] {
  return stringArray(value).map((role) => role.toUpperCase().replace(/[-\s]+/g, "_") as AdminRole);
}

function safeIcon(value: unknown): string {
  const icon = text(value);
  return SAFE_ICON.test(icon) ? icon : "Puzzle";
}

function safeHref(value: unknown): string | null {
  const href = text(value);
  return SAFE_HREF.test(href) ? href : null;
}

function normalizeMenu(
  pluginKey: string,
  raw: Record<string, unknown>,
  index: number,
): { group: string; groupOrder: number; item: AdminNavItem } | null {
  const href = safeHref(raw.href ?? raw.route ?? raw.path);
  const label = text(raw.label ?? raw.name ?? raw.title);
  if (!href || !label) return null;

  const group = text(raw.group ?? raw.section) || "Extensions";
  const roles = roleArray(raw.roles);
  const key = text(raw.key) || `${pluginKey}.menu.${index}`;
  const order = number(raw.order ?? raw.priority, 1000 + index);

  return {
    group,
    groupOrder: number(raw.groupOrder, 900),
    item: {
      id: key,
      name: label,
      label,
      href,
      icon: safeIcon(raw.icon),
      section: group,
      group,
      keywords: stringArray(raw.keywords),
      roles: roles.length ? roles : ["SUPER_ADMIN", "ADMIN"],
      permissionAnyOf: stringArray(raw.permissionAnyOf ?? raw.permissions),
      moduleKey: text(raw.moduleKey) || pluginKey,
      featureFlag: text(raw.featureFlag) || undefined,
      order,
      disabled: raw.disabled === true,
    },
  };
}

export async function loadPluginNavigation(role: UserRole): Promise<AdminNavGroup[]> {
  try {
    const visibility = await getTenantPluginVisibility();
    const grouped = new Map<string, AdminNavGroup>();

    for (const plugin of visibility.plugins) {
      if (!plugin.enabled || !plugin.effectiveAccess || plugin.status !== "ACTIVE") continue;

      plugin.menus.forEach((raw, index) => {
        const normalized = normalizeMenu(plugin.pluginKey, raw, index);
        if (!normalized || !normalized.item.roles.includes(role as AdminRole)) return;

        const id = `plugin-${normalized.group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        const existing = grouped.get(id);
        if (existing) {
          existing.items.push(normalized.item);
          return;
        }

        grouped.set(id, {
          id,
          name: normalized.group,
          label: normalized.group,
          title: normalized.group,
          section: normalized.group,
          icon: normalized.item.icon,
          items: [normalized.item],
          roles: normalized.item.roles,
          order: normalized.groupOrder,
        });
      });
    }

    return [...grouped.values()]
      .map((group) => ({ ...group, items: [...group.items].sort((a: AdminNavItem, b: AdminNavItem) => a.order - b.order) }))
      .sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export function mergeNavigationGroups(
  coreGroups: AdminNavGroup[],
  pluginGroups: AdminNavGroup[],
): AdminNavGroup[] {
  const merged = new Map<string, AdminNavGroup>();

  for (const group of [...coreGroups, ...pluginGroups]) {
    const existing = merged.get(group.id);
    if (!existing) {
      merged.set(group.id, { ...group, items: [...group.items] });
      continue;
    }

    const items = new Map(existing.items.map((item) => [item.id, item]));
    for (const item of group.items) items.set(item.id, item);
    existing.items = [...items.values()].sort((a: AdminNavItem, b: AdminNavItem) => a.order - b.order);
  }

  return [...merged.values()].sort((a, b) => a.order - b.order);
}
