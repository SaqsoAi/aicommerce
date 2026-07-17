import prisma from "../../config/prisma";
import { pluginAccessService } from "./plugin-platform.access.service";
import { pluginRegistryService } from "./plugin-platform.registry.service";
import type {
  PluginConfigurationDocument,
  PluginConfigurationField,
  PluginConfigurationFieldType,
  PluginConfigurationValidationIssue,
} from "./plugin-platform.configuration.types";

const SECRET_REFERENCE_PATTERN =
  /^(vault|secret-manager|env-ref|supabase-vault):[A-Za-z0-9._/-]{1,240}$/;

function fail(code: string, message: string, statusCode = 422): never {
  throw Object.assign(new Error(message), { code, statusCode });
}

function reasonOf(value: unknown): string {
  const reason = String(value || "").trim();
  if (reason.length < 5) {
    fail("PLUGIN_CONFIG_REASON_REQUIRED", "A reason of at least 5 characters is required");
  }
  return reason.slice(0, 500);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function fieldType(schema: Record<string, unknown>): PluginConfigurationFieldType {
  const value = String(schema.type || "TEXT").toUpperCase();
  if (
    ["TEXT", "TEXTAREA", "NUMBER", "BOOLEAN", "SELECT", "JSON", "SECRET_REFERENCE"].includes(
      value
    )
  ) {
    return value as PluginConfigurationFieldType;
  }
  return "TEXT";
}

function optionsOf(schema: Record<string, unknown>): Array<{ label: string; value: string }> {
  if (!Array.isArray(schema.options)) return [];
  return schema.options
    .map((option) => {
      if (typeof option === "string") return { label: option, value: option };
      const item = record(option);
      const value = String(item.value ?? "");
      if (!value) return null;
      return { label: String(item.label || value), value };
    })
    .filter((item): item is { label: string; value: string } => Boolean(item));
}

function maskSecret(value: unknown): unknown {
  return typeof value === "string" && value ? "••••••••" : undefined;
}

function validateValue(
  field: {
    settingKey: string;
    schema: unknown;
    defaultValue: unknown;
  },
  value: unknown
): PluginConfigurationValidationIssue[] {
  const schema = record(field.schema);
  const type = fieldType(schema);
  const issues: PluginConfigurationValidationIssue[] = [];
  const required = schema.required === true;
  const empty = value === undefined || value === null || value === "";

  if (required && empty) {
    issues.push({
      code: "PLUGIN_CONFIG_REQUIRED",
      field: field.settingKey,
      message: "A value is required.",
    });
    return issues;
  }
  if (empty) return issues;

  if ((type === "TEXT" || type === "TEXTAREA") && typeof value !== "string") {
    issues.push({
      code: "PLUGIN_CONFIG_TYPE",
      field: field.settingKey,
      message: "A text value is required.",
    });
  }

  if (type === "NUMBER") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      issues.push({
        code: "PLUGIN_CONFIG_TYPE",
        field: field.settingKey,
        message: "A finite number is required.",
      });
    } else {
      if (typeof schema.minimum === "number" && value < schema.minimum) {
        issues.push({
          code: "PLUGIN_CONFIG_MINIMUM",
          field: field.settingKey,
          message: `Value must be at least ${schema.minimum}.`,
        });
      }
      if (typeof schema.maximum === "number" && value > schema.maximum) {
        issues.push({
          code: "PLUGIN_CONFIG_MAXIMUM",
          field: field.settingKey,
          message: `Value must be at most ${schema.maximum}.`,
        });
      }
    }
  }

  if (type === "BOOLEAN" && typeof value !== "boolean") {
    issues.push({
      code: "PLUGIN_CONFIG_TYPE",
      field: field.settingKey,
      message: "A boolean value is required.",
    });
  }

  if (type === "SELECT") {
    const allowed = optionsOf(schema).map((item) => item.value);
    if (typeof value !== "string" || !allowed.includes(value)) {
      issues.push({
        code: "PLUGIN_CONFIG_OPTION",
        field: field.settingKey,
        message: "Value is not one of the registered options.",
      });
    }
  }

  if (type === "JSON") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      issues.push({
        code: "PLUGIN_CONFIG_TYPE",
        field: field.settingKey,
        message: "A JSON object is required.",
      });
    }
  }

  if (
    type === "SECRET_REFERENCE" &&
    (typeof value !== "string" || !SECRET_REFERENCE_PATTERN.test(value))
  ) {
    issues.push({
      code: "PLUGIN_CONFIG_SECRET_REFERENCE",
      field: field.settingKey,
      message:
        "Use an approved secret reference such as vault:path/key. Raw secrets are not accepted.",
    });
  }

  if (typeof value === "string") {
    if (typeof schema.minLength === "number" && value.length < schema.minLength) {
      issues.push({
        code: "PLUGIN_CONFIG_MIN_LENGTH",
        field: field.settingKey,
        message: `Value must contain at least ${schema.minLength} characters.`,
      });
    }
    if (typeof schema.maxLength === "number" && value.length > schema.maxLength) {
      issues.push({
        code: "PLUGIN_CONFIG_MAX_LENGTH",
        field: field.settingKey,
        message: `Value must contain no more than ${schema.maxLength} characters.`,
      });
    }
    if (typeof schema.pattern === "string") {
      try {
        if (!new RegExp(schema.pattern).test(value)) {
          issues.push({
            code: "PLUGIN_CONFIG_PATTERN",
            field: field.settingKey,
            message: "Value does not match the registered pattern.",
          });
        }
      } catch {
        issues.push({
          code: "PLUGIN_CONFIG_SCHEMA_PATTERN",
          field: field.settingKey,
          message: "The registered validation pattern is invalid.",
        });
      }
    }
  }

  return issues;
}

export class PluginConfigurationService {
  private async plugin(pluginKey: string, tenantId?: string) {
    const plugin = await (prisma as any).plugin.findUnique({
      where: { pluginKey },
      include: {
        settings: { orderBy: { settingKey: "asc" } },
        settingValues: {
          where: tenantId
            ? {
                OR: [
                  { scope: "GLOBAL", tenantId: null },
                  { scope: "TENANT", tenantId },
                ],
              }
            : { scope: "GLOBAL", tenantId: null },
          orderBy: { updatedAt: "desc" },
        },
      },
    });
    if (!plugin) fail("PLUGIN_NOT_FOUND", "Plugin not found", 404);
    return plugin;
  }

  async document(pluginKey: string, tenantId?: string): Promise<PluginConfigurationDocument> {
    const plugin = await this.plugin(pluginKey, tenantId);
    const values = new Map<string, unknown>();

    for (const item of plugin.settingValues as any[]) {
      const key = `${item.scope}:${item.tenantId || ""}:${item.settingKey}`;
      if (!values.has(key)) values.set(key, item.value);
    }

    const fields: PluginConfigurationField[] = (plugin.settings as any[]).map((definition) => {
      const schema = record(definition.schema);
      const type = fieldType(schema);
      const globalValue = values.get(`GLOBAL::${definition.settingKey}`);
      const tenantValue = tenantId
        ? values.get(`TENANT:${tenantId}:${definition.settingKey}`)
        : undefined;

      let effectiveValue: unknown;
      let inheritedFrom: PluginConfigurationField["inheritedFrom"] = "NONE";

      if (tenantId && tenantValue !== undefined) {
        effectiveValue = tenantValue;
        inheritedFrom = "TENANT";
      } else if (globalValue !== undefined) {
        effectiveValue = globalValue;
        inheritedFrom = "GLOBAL";
      } else if (definition.defaultValue !== undefined && definition.defaultValue !== null) {
        effectiveValue = definition.defaultValue;
        inheritedFrom = "DEFAULT";
      }

      const secretConfigured = type === "SECRET_REFERENCE" && effectiveValue !== undefined;

      return {
        key: definition.settingKey,
        label: String(schema.label || definition.settingKey),
        description:
          typeof schema.description === "string" ? schema.description : undefined,
        type,
        scope: definition.scope,
        required: schema.required === true,
        tenantAdminEditable: schema.tenantAdminEditable === true,
        options: optionsOf(schema),
        validation: schema,
        defaultValue:
          type === "SECRET_REFERENCE" ? maskSecret(definition.defaultValue) : definition.defaultValue,
        globalValue:
          type === "SECRET_REFERENCE" ? maskSecret(globalValue) : globalValue,
        tenantValue:
          type === "SECRET_REFERENCE" ? maskSecret(tenantValue) : tenantValue,
        effectiveValue:
          type === "SECRET_REFERENCE" ? maskSecret(effectiveValue) : effectiveValue,
        inheritedFrom,
        configured: effectiveValue !== undefined,
        secretReferenceConfigured: secretConfigured,
      };
    });

    const missingRequired = fields
      .filter((field) => field.required && !field.configured)
      .map((field) => field.key);

    return {
      pluginKey,
      pluginName: plugin.name,
      tenantId,
      generatedAt: new Date().toISOString(),
      fields,
      complete: missingRequired.length === 0,
      missingRequired,
    };
  }

  async validate(
    pluginKey: string,
    settingKey: string,
    value: unknown
  ): Promise<{ valid: boolean; issues: PluginConfigurationValidationIssue[] }> {
    const plugin = await this.plugin(pluginKey);
    const definition = (plugin.settings as any[]).find(
      (item) => item.settingKey === settingKey
    );
    if (!definition) fail("PLUGIN_CONFIG_UNKNOWN_SETTING", "Setting is not registered", 404);
    const issues = validateValue(definition, value);
    return { valid: issues.length === 0, issues };
  }

  async save(input: {
    pluginKey: string;
    settingKey: string;
    scope: string;
    tenantId?: string;
    value: unknown;
    reason: unknown;
    actorId: string;
  }) {
    const reason = reasonOf(input.reason);
    const plugin = await this.plugin(input.pluginKey);
    const definition = (plugin.settings as any[]).find(
      (item) => item.settingKey === input.settingKey
    );
    if (!definition) fail("PLUGIN_CONFIG_UNKNOWN_SETTING", "Setting is not registered", 404);

    const scope = String(input.scope || "").toUpperCase();
    if (!["GLOBAL", "TENANT"].includes(scope) || definition.scope !== scope) {
      fail("PLUGIN_CONFIG_SCOPE", "Setting scope does not match its registered definition");
    }
    if (scope === "TENANT" && !input.tenantId) {
      fail("PLUGIN_CONFIG_TENANT_REQUIRED", "tenantId is required for tenant settings");
    }

    const issues = validateValue(definition, input.value);
    if (issues.length) {
      throw Object.assign(new Error(issues[0].message), {
        statusCode: 422,
        code: issues[0].code,
        issues,
      });
    }

    const saved = await (prisma as any).pluginSettingValue.upsert({
      where: {
        pluginId_settingKey_scope_tenantId: {
          pluginId: plugin.id,
          settingKey: input.settingKey,
          scope,
          tenantId: scope === "TENANT" ? input.tenantId : null,
        },
      },
      update: {
        value: input.value as any,
        updatedBy: input.actorId,
      },
      create: {
        pluginId: plugin.id,
        settingKey: input.settingKey,
        scope,
        tenantId: scope === "TENANT" ? input.tenantId : null,
        value: input.value as any,
        updatedBy: input.actorId,
      },
    });

    await (prisma as any).pluginAuditEvent.create({
      data: {
        pluginId: plugin.id,
        actorId: input.actorId,
        action: "PLUGIN_CONFIGURATION_UPDATED",
        outcome: "SUCCESS",
        reason,
        metadata: {
          settingKey: input.settingKey,
          scope,
          tenantId: input.tenantId || null,
          secretReference: fieldType(record(definition.schema)) === "SECRET_REFERENCE",
        },
      },
    });

    pluginAccessService.invalidate(input.pluginKey, input.tenantId);
    pluginRegistryService.invalidate();

    return {
      id: saved.id,
      settingKey: saved.settingKey,
      scope: saved.scope,
      tenantId: saved.tenantId,
      updatedAt: saved.updatedAt,
      secretReference:
        fieldType(record(definition.schema)) === "SECRET_REFERENCE",
    };
  }

  async history(pluginKey: string, tenantId?: string) {
    const plugin = await (prisma as any).plugin.findUnique({
      where: { pluginKey },
      select: { id: true },
    });
    if (!plugin) fail("PLUGIN_NOT_FOUND", "Plugin not found", 404);

    const events = await (prisma as any).pluginAuditEvent.findMany({
      where: {
        pluginId: plugin.id,
        action: "PLUGIN_CONFIGURATION_UPDATED",
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    if (!tenantId) return events;
    return events.filter((event: any) => {
      const metadata = record(event.metadata);
      return metadata.tenantId === tenantId || metadata.tenantId === null;
    });
  }
}

export const pluginConfigurationService = new PluginConfigurationService();
