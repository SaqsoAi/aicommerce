import prisma from "../../config/prisma";
import { pluginAccessService } from "./plugin-platform.access.service";
import { pluginConfigurationService } from "./plugin-platform.configuration.service";
import { pluginRegistryService } from "./plugin-platform.registry.service";
import type {
  TenantPluginContext,
  TenantPluginVisibilityDocument,
} from "./plugin-platform.tenant.types";

const TENANT_CONFIGURATION_ROLES = new Set([
  "ADMIN",
  "MANAGER",
]);

function fail(code: string, message: string, statusCode = 403): never {
  throw Object.assign(new Error(message), { code, statusCode });
}

function reasonOf(value: unknown): string {
  const reason = String(value || "").trim();
  if (reason.length < 5) {
    fail(
      "TENANT_PLUGIN_REASON_REQUIRED",
      "A reason of at least 5 characters is required",
      422
    );
  }
  return reason.slice(0, 500);
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export class PluginTenantService {
  private ensureTenant(context: TenantPluginContext): void {
    if (!context.tenantId) {
      fail(
        "TENANT_CONTEXT_REQUIRED",
        "Authenticated token does not contain a trusted tenantId claim",
        401
      );
    }
  }

  private ensureTenantEditor(context: TenantPluginContext): void {
    this.ensureTenant(context);
    if (!TENANT_CONFIGURATION_ROLES.has(context.role)) {
      fail(
        "TENANT_PLUGIN_CONFIGURATION_FORBIDDEN",
        "Current role cannot modify tenant plugin configuration"
      );
    }
  }

  async configuration(
    pluginKey: string,
    context: TenantPluginContext
  ) {
    this.ensureTenant(context);

    const access = await pluginAccessService.evaluate(
      pluginKey,
      context.tenantId
    );
    if (!access.allowed) {
      fail(
        "TENANT_PLUGIN_ACCESS_DENIED",
        access.reasons.find((item) => !item.allowed)?.message ||
          "Plugin is not available to this tenant"
      );
    }

    const document = await pluginConfigurationService.document(
      pluginKey,
      context.tenantId
    );

    return {
      ...document,
      fields: document.fields.filter(
        (field) =>
          field.scope === "TENANT" &&
          field.tenantAdminEditable === true
      ),
    };
  }

  async validate(input: {
    pluginKey: string;
    settingKey: string;
    value: unknown;
    context: TenantPluginContext;
  }) {
    this.ensureTenantEditor(input.context);

    const document = await this.configuration(
      input.pluginKey,
      input.context
    );
    const field = document.fields.find(
      (item) => item.key === input.settingKey
    );

    if (!field) {
      fail(
        "TENANT_PLUGIN_SETTING_NOT_EDITABLE",
        "Setting is not registered as tenant-admin editable",
        404
      );
    }

    return pluginConfigurationService.validate(
      input.pluginKey,
      input.settingKey,
      input.value
    );
  }

  async save(input: {
    pluginKey: string;
    settingKey: string;
    value: unknown;
    reason: unknown;
    context: TenantPluginContext;
  }) {
    this.ensureTenantEditor(input.context);
    const reason = reasonOf(input.reason);

    const document = await this.configuration(
      input.pluginKey,
      input.context
    );
    const field = document.fields.find(
      (item) => item.key === input.settingKey
    );

    if (!field) {
      fail(
        "TENANT_PLUGIN_SETTING_NOT_EDITABLE",
        "Setting is not registered as tenant-admin editable",
        404
      );
    }

    return pluginConfigurationService.save({
      pluginKey: input.pluginKey,
      settingKey: input.settingKey,
      scope: "TENANT",
      tenantId: input.context.tenantId,
      value: input.value,
      reason,
      actorId: input.context.actorId,
    });
  }

  async history(
    pluginKey: string,
    context: TenantPluginContext
  ) {
    this.ensureTenant(context);
    return pluginConfigurationService.history(
      pluginKey,
      context.tenantId
    );
  }

  async visibility(
    context: TenantPluginContext
  ): Promise<TenantPluginVisibilityDocument> {
    this.ensureTenant(context);

    const [plugins, registry] = await Promise.all([
      (prisma as any).plugin.findMany({
        where: { status: "ACTIVE" },
        select: {
          pluginKey: true,
          name: true,
          status: true,
        },
        orderBy: { pluginKey: "asc" },
      }),
      pluginRegistryService.resolve({
        tenantId: context.tenantId,
        role: context.role,
      }),
    ]);

    const registryByPlugin = new Map<
      string,
      Array<{
        registryType: string;
        payload: Record<string, unknown>;
      }>
    >();

    for (const entry of registry.entries) {
      const current = registryByPlugin.get(entry.pluginKey) || [];
      current.push({
        registryType: entry.registryType,
        payload: objectValue(entry.payload),
      });
      registryByPlugin.set(entry.pluginKey, current);
    }

    const visible = [];
    for (const plugin of plugins) {
      const access = await pluginAccessService.evaluate(
        plugin.pluginKey,
        context.tenantId
      );
      const entries = registryByPlugin.get(plugin.pluginKey) || [];

      visible.push({
        pluginKey: plugin.pluginKey,
        name: plugin.name,
        enabled: access.allowed,
        status: plugin.status,
        effectiveAccess: access.allowed,
        menus: entries
          .filter((item) => item.registryType === "MENU")
          .map((item) => item.payload),
        widgets: entries
          .filter((item) => item.registryType === "WIDGET")
          .map((item) => item.payload),
        capabilities: entries
          .filter((item) => item.registryType === "CAPABILITY")
          .map((item) => item.payload),
      });
    }

    return {
      tenantId: context.tenantId,
      generatedAt: new Date().toISOString(),
      plugins: visible,
    };
  }
}

export const pluginTenantService = new PluginTenantService();
