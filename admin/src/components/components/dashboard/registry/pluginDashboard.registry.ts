import { getTenantPluginVisibility } from "@/api/pluginPlatform.api";
import type { UserRole } from "@/config/roles";

export type PluginDashboardWidget = {
  key: string;
  pluginKey: string;
  title: string;
  type: string;
  order: number;
  route?: string;
  permission?: string;
  roles: string[];
  payload: Record<string, unknown>;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function loadPluginDashboardWidgets(role: UserRole): Promise<PluginDashboardWidget[]> {
  try {
    const visibility = await getTenantPluginVisibility();
    const widgets: PluginDashboardWidget[] = [];

    for (const plugin of visibility.plugins) {
      if (!plugin.enabled || !plugin.effectiveAccess || plugin.status !== "ACTIVE") continue;

      plugin.widgets.forEach((payload, index) => {
        const roles = Array.isArray(payload.roles)
          ? payload.roles.map((entry) => text(entry).toUpperCase()).filter(Boolean)
          : [];
        if (roles.length && !roles.includes(role)) return;

        const key = text(payload.key) || `${plugin.pluginKey}.widget.${index}`;
        widgets.push({
          key,
          pluginKey: plugin.pluginKey,
          title: text(payload.title ?? payload.label ?? payload.name) || "Plugin Widget",
          type: text(payload.type) || "status",
          order: number(payload.order ?? payload.priority, 1000 + index),
          route: text(payload.route ?? payload.href) || undefined,
          permission: text(payload.permission) || undefined,
          roles,
          payload,
        });
      });
    }

    return widgets.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
  } catch {
    return [];
  }
}
