import { createHash } from "crypto";
import prisma from "../../config/prisma";
import { pluginAccessService } from "./plugin-platform.access.service";
import type {
  PluginRegistryEntry,
  PluginRegistryIssue,
  PluginRegistryResolution,
  PluginRegistrySnapshot,
  PluginRegistryType,
} from "./plugin-platform.registry.types";

const CACHE_TTL_SECONDS = Math.max(
  10,
  Number(process.env.PLUGIN_REGISTRY_CACHE_TTL_SECONDS || 60)
);

const APPROVED_ROUTE_KEYS = new Set([
  "host.plugin.detail",
  "host.plugin.settings",
  "host.plugin.health",
  "host.plugin.transactions",
  "host.plugin.example.analytics",
]);

const APPROVED_WIDGET_ADAPTERS = new Set([
  "host.widget.analyticsSummary",
  "host.widget.kpi",
  "host.widget.status",
  "host.widget.activity",
  "host.widget.health",
]);

const APPROVED_EVENT_ADAPTERS = new Set([
  "host.event.audit",
  "host.event.notification",
  "host.event.webhook",
  "host.event.queue",
]);

const APPROVED_CAPABILITY_ADAPTERS = new Set([
  "host.capability.read",
  "host.capability.write",
  "host.capability.report",
  "host.capability.notification",
  "host.capability.search",
  "host.capability.ai",
]);

let cached: { expiresAt: number; snapshot: PluginRegistrySnapshot } | null = null;

function array(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item)
      )
    : [];
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function priority(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.max(-10000, Math.min(10000, Math.trunc(parsed)))
    : 1000;
}

function stableVersion(entries: PluginRegistryEntry[]): string {
  const canonical = JSON.stringify(
    entries.map((entry) => ({
      type: entry.registryType,
      key: entry.key,
      pluginKey: entry.pluginKey,
      priority: entry.priority,
      adapterKey: entry.adapterKey,
      routeKey: entry.routeKey,
      payload: entry.payload,
    }))
  );
  return createHash("sha256").update(canonical).digest("hex");
}

function addIssue(
  issues: PluginRegistryIssue[],
  issue: PluginRegistryIssue
): void {
  issues.push(issue);
}

function namespaced(pluginKey: string, key: string): boolean {
  return key === pluginKey || key.startsWith(`${pluginKey}.`);
}

function adapterAllowed(
  type: PluginRegistryType,
  adapterKey?: string,
  routeKey?: string
): boolean {
  if (type === "MENU") return Boolean(routeKey && APPROVED_ROUTE_KEYS.has(routeKey));
  if (type === "WIDGET") return Boolean(adapterKey && APPROVED_WIDGET_ADAPTERS.has(adapterKey));
  if (type === "EVENT") return Boolean(adapterKey && APPROVED_EVENT_ADAPTERS.has(adapterKey));
  if (type === "CAPABILITY") {
    return Boolean(adapterKey && APPROVED_CAPABILITY_ADAPTERS.has(adapterKey));
  }
  return true;
}

export class PluginRegistryService {
  invalidate(): number {
    const existed = cached ? 1 : 0;
    cached = null;
    return existed;
  }

  async snapshot(refresh = false): Promise<PluginRegistrySnapshot> {
    if (!refresh && cached && cached.expiresAt > Date.now()) {
      return cached.snapshot;
    }

    const plugins = await (prisma as any).plugin.findMany({
      where: { status: "ACTIVE" },
      include: {
        permissions: true,
        settings: true,
      },
      orderBy: { pluginKey: "asc" },
    });

    const entries: PluginRegistryEntry[] = [];
    const issues: PluginRegistryIssue[] = [];
    const seen = new Map<string, PluginRegistryEntry>();

    const register = (entry: PluginRegistryEntry): void => {
      const collisionKey = `${entry.registryType}:${entry.key.toLowerCase()}`;
      const existing = seen.get(collisionKey);

      if (!namespaced(entry.pluginKey, entry.key)) {
        addIssue(issues, {
          code: "REGISTRY_NAMESPACE",
          severity: "ERROR",
          pluginKey: entry.pluginKey,
          registryType: entry.registryType,
          registrationKey: entry.key,
          message: "Registration key must be namespaced by pluginKey.",
        });
        entry.enabled = false;
      }

      if (!adapterAllowed(entry.registryType, entry.adapterKey, entry.routeKey)) {
        addIssue(issues, {
          code: "REGISTRY_ADAPTER_NOT_APPROVED",
          severity: "ERROR",
          pluginKey: entry.pluginKey,
          registryType: entry.registryType,
          registrationKey: entry.key,
          message:
            "Registration references a route or adapter that is not approved by the host.",
        });
        entry.enabled = false;
      }

      if (existing) {
        addIssue(issues, {
          code: "REGISTRY_DUPLICATE_KEY",
          severity: "ERROR",
          pluginKey: entry.pluginKey,
          registryType: entry.registryType,
          registrationKey: entry.key,
          message: `Key collides with plugin ${existing.pluginKey}.`,
        });
        entry.enabled = false;
        existing.enabled = false;
      } else {
        seen.set(collisionKey, entry);
      }

      entries.push(entry);
    };

    for (const plugin of plugins as any[]) {
      const manifest = (plugin.manifest || {}) as Record<string, unknown>;

      for (const permission of plugin.permissions || []) {
        register({
          registryType: "PERMISSION",
          key: String(permission.permissionCode),
          pluginKey: plugin.pluginKey,
          priority: 1000,
          enabled: true,
          payload: {
            name: permission.name,
            description: permission.description,
          },
        });
      }

      for (const setting of plugin.settings || []) {
        register({
          registryType: "SETTING",
          key: String(setting.settingKey),
          pluginKey: plugin.pluginKey,
          priority: 1000,
          enabled: true,
          payload: {
            scope: setting.scope,
            schema: setting.schema,
            defaultValue: setting.defaultValue,
          },
        });
      }

      const registrySources: Array<{
        type: PluginRegistryType;
        values: Array<Record<string, unknown>>;
      }> = [
        { type: "MENU", values: array(manifest.menus) },
        { type: "WIDGET", values: array(manifest.widgets) },
        { type: "EVENT", values: array(manifest.events) },
        { type: "CAPABILITY", values: array(manifest.capabilities) },
      ];

      for (const source of registrySources) {
        for (const item of source.values) {
          const key = text(item.key);
          if (!key) {
            addIssue(issues, {
              code: "REGISTRY_KEY_REQUIRED",
              severity: "ERROR",
              pluginKey: plugin.pluginKey,
              registryType: source.type,
              message: "Registry entry is missing a key.",
            });
            continue;
          }

          register({
            registryType: source.type,
            key,
            pluginKey: plugin.pluginKey,
            priority: priority(item.priority ?? item.order),
            enabled: item.enabled !== false,
            adapterKey: text(item.adapterKey || item.componentKey) || undefined,
            routeKey: text(item.routeKey) || undefined,
            permission: text(item.permission) || undefined,
            roles: Array.isArray(item.roles)
              ? item.roles.filter((role): role is string => typeof role === "string")
              : undefined,
            payload: item,
          });
        }
      }
    }

    entries.sort(
      (a, b) =>
        a.registryType.localeCompare(b.registryType) ||
        a.priority - b.priority ||
        a.key.localeCompare(b.key)
    );

    const now = Date.now();
    const counts = {
      MENU: entries.filter((entry) => entry.registryType === "MENU").length,
      PERMISSION: entries.filter((entry) => entry.registryType === "PERMISSION").length,
      WIDGET: entries.filter((entry) => entry.registryType === "WIDGET").length,
      SETTING: entries.filter((entry) => entry.registryType === "SETTING").length,
      EVENT: entries.filter((entry) => entry.registryType === "EVENT").length,
      CAPABILITY: entries.filter((entry) => entry.registryType === "CAPABILITY").length,
    };

    const snapshot: PluginRegistrySnapshot = {
      version: stableVersion(entries),
      generatedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + CACHE_TTL_SECONDS * 1000).toISOString(),
      healthy: !issues.some((issue) => issue.severity === "ERROR"),
      plugins: plugins.map((plugin: any) => plugin.pluginKey),
      counts,
      entries,
      issues,
    };

    cached = {
      expiresAt: now + CACHE_TTL_SECONDS * 1000,
      snapshot,
    };

    return snapshot;
  }

  async health(refresh = false) {
    const snapshot = await this.snapshot(refresh);
    return {
      healthy: snapshot.healthy,
      version: snapshot.version,
      generatedAt: snapshot.generatedAt,
      plugins: snapshot.plugins.length,
      entries: snapshot.entries.length,
      enabledEntries: snapshot.entries.filter((entry) => entry.enabled).length,
      errors: snapshot.issues.filter((issue) => issue.severity === "ERROR").length,
      warnings: snapshot.issues.filter((issue) => issue.severity === "WARNING").length,
      counts: snapshot.counts,
      issues: snapshot.issues,
    };
  }

  async resolve(input: {
    tenantId?: string;
    role?: string;
    registryType?: PluginRegistryType;
    refresh?: boolean;
  }): Promise<PluginRegistryResolution> {
    const snapshot = await this.snapshot(Boolean(input.refresh));
    const excluded: PluginRegistryResolution["excluded"] = [];
    const access = new Map<string, boolean>();

    if (input.tenantId) {
      for (const pluginKey of snapshot.plugins) {
        try {
          const result = await pluginAccessService.evaluate(
            pluginKey,
            input.tenantId,
            Boolean(input.refresh)
          );
          access.set(pluginKey, result.allowed);
          if (!result.allowed) {
            excluded.push({
              pluginKey,
              reason:
                result.reasons.find((reason) => !reason.allowed)?.message ||
                "Effective tenant access denied.",
            });
          }
        } catch (error) {
          access.set(pluginKey, false);
          excluded.push({
            pluginKey,
            reason: error instanceof Error ? error.message : "Access evaluation failed.",
          });
        }
      }
    }

    const entries = snapshot.entries.filter((entry) => {
      if (!entry.enabled) return false;
      if (input.registryType && entry.registryType !== input.registryType) return false;
      if (input.tenantId && access.get(entry.pluginKey) !== true) return false;
      if (input.role && entry.roles?.length && !entry.roles.includes(input.role)) return false;
      return true;
    });

    return {
      tenantId: input.tenantId,
      generatedAt: new Date().toISOString(),
      snapshotVersion: snapshot.version,
      entries,
      excluded,
    };
  }
}

export const pluginRegistryService = new PluginRegistryService();
