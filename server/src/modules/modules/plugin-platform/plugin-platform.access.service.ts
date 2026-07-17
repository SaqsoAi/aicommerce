import prisma from "../../config/prisma";

export interface PluginAccessReason {
  code: string;
  allowed: boolean;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface PluginEffectiveAccess {
  pluginKey: string;
  tenantId: string;
  allowed: boolean;
  evaluatedAt: string;
  cacheTtlSeconds: number;
  pluginStatus: string;
  assignmentEnabled: boolean;
  subscriptionSatisfied: boolean;
  featureFlagsSatisfied: boolean;
  dependenciesSatisfied: boolean;
  configurationSatisfied: boolean;
  reasons: PluginAccessReason[];
}

type CacheEntry = { expiresAt: number; value: PluginEffectiveAccess };

const cache = new Map<string, CacheEntry>();
const TTL_SECONDS = Math.max(10, Number(process.env.PLUGIN_ACCESS_CACHE_TTL_SECONDS || 60));

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function planEntitlements(features: unknown): Set<string> {
  if (Array.isArray(features)) return new Set(asStringArray(features));
  if (features && typeof features === "object") {
    const record = features as Record<string, unknown>;
    const enabled = Object.entries(record)
      .filter(([, value]) => value === true)
      .map(([key]) => key);
    return new Set([...enabled, ...asStringArray(record.entitlements)]);
  }
  return new Set();
}

function activeSubscription(status: string): boolean {
  return ["ACTIVE", "TRIAL", "TRIALING"].includes(status.toUpperCase());
}

function cacheKey(pluginKey: string, tenantId: string): string {
  return `${pluginKey.toLowerCase()}::${tenantId}`;
}

export class PluginAccessService {
  invalidate(pluginKey?: string, tenantId?: string): number {
    let removed = 0;
    for (const key of [...cache.keys()]) {
      const [cachedPlugin, cachedTenant] = key.split("::");
      if (
        (!pluginKey || cachedPlugin === pluginKey.toLowerCase()) &&
        (!tenantId || cachedTenant === tenantId)
      ) {
        cache.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  async evaluate(pluginKey: string, tenantId: string, bypassCache = false): Promise<PluginEffectiveAccess> {
    if (!pluginKey || !tenantId) {
      throw Object.assign(new Error("pluginKey and tenantId are required"), {
        statusCode: 422,
        code: "PLUGIN_ACCESS_INPUT",
      });
    }

    const key = cacheKey(pluginKey, tenantId);
    const existing = cache.get(key);
    if (!bypassCache && existing && existing.expiresAt > Date.now()) return existing.value;

    const plugin = await (prisma as any).plugin.findUnique({
      where: { pluginKey },
      include: {
        tenantAccess: { where: { tenantId }, take: 1 },
        dependencies: { include: { dependency: true } },
        settings: true,
        settingValues: {
          where: { OR: [{ scope: "GLOBAL" }, { scope: "TENANT", tenantId }] },
        },
      },
    });
    if (!plugin) {
      throw Object.assign(new Error("Plugin not found"), {
        statusCode: 404,
        code: "PLUGIN_NOT_FOUND",
      });
    }

    const manifest = (plugin.manifest || {}) as Record<string, any>;
    const requirements = (manifest.subscriptionRequirements || {}) as Record<string, unknown>;
    const requiredPlans = asStringArray(requirements.requiredPlanKeys);
    const requiredEntitlements = asStringArray(requirements.requiredEntitlements);
    const requiredFlags = asStringArray(manifest.featureFlags);
    const tenantScope = String(plugin.tenantScope || manifest.tenantScope || "TENANT_ASSIGNABLE");

    const [subscription, flags] = await Promise.all([
      (prisma as any).tenantSubscription.findFirst({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
      }),
      requiredFlags.length
        ? (prisma as any).featureFlag.findMany({ where: { key: { in: requiredFlags } } })
        : Promise.resolve([]),
    ]);

    const plan = subscription
      ? await (prisma as any).subscriptionPlan.findUnique({ where: { key: subscription.planKey } })
      : null;

    const reasons: PluginAccessReason[] = [];

    const pluginStatusAllowed = plugin.status === "ACTIVE";
    reasons.push({
      code: "PLUGIN_STATUS",
      allowed: pluginStatusAllowed,
      message: pluginStatusAllowed ? "Plugin is globally active." : `Plugin status is ${plugin.status}.`,
    });

    const assignment = plugin.tenantAccess[0];
    const assignmentEnabled =
      tenantScope === "ALL_TENANTS" ? true :
      tenantScope === "PLATFORM_ONLY" ? false :
      Boolean(assignment?.enabled);
    reasons.push({
      code: "TENANT_ASSIGNMENT",
      allowed: assignmentEnabled,
      message:
        tenantScope === "PLATFORM_ONLY"
          ? "Platform-only plugins are not tenant-accessible."
          : assignmentEnabled
            ? "Tenant assignment allows access."
            : "Tenant assignment is missing or disabled.",
      metadata: { tenantScope },
    });

    const planAllowed =
      requiredPlans.length === 0 ||
      Boolean(subscription && activeSubscription(subscription.status) && requiredPlans.includes(subscription.planKey));
    const entitlements = planEntitlements(plan?.features);
    const entitlementAllowed =
      requiredEntitlements.length === 0 ||
      requiredEntitlements.every((item) => entitlements.has(item));
    const subscriptionSatisfied = planAllowed && entitlementAllowed;
    reasons.push({
      code: "SUBSCRIPTION",
      allowed: subscriptionSatisfied,
      message: subscriptionSatisfied
        ? "Subscription requirements are satisfied."
        : "Required subscription plan or entitlement is unavailable.",
      metadata: {
        currentPlan: subscription?.planKey || null,
        subscriptionStatus: subscription?.status || null,
        requiredPlans,
        requiredEntitlements,
      },
    });

    type FeatureFlagRecord = {
      key: string;
      enabled: boolean;
      active?: boolean | null;
      scope?: string | null;
      config?: unknown;
    };

    const flagMap = new Map<string, FeatureFlagRecord>(
      (flags as FeatureFlagRecord[]).map((flag) => [flag.key, flag])
    );

    const featureFlagsSatisfied = requiredFlags.every((flagKey) => {
      const flag = flagMap.get(flagKey);
      if (!flag?.enabled || flag.active === false) return false;
      if (String(flag.scope || "GLOBAL").toUpperCase() === "GLOBAL") return true;
      const config = (flag.config || {}) as Record<string, unknown>;
      const tenantIds = asStringArray(config.tenantIds);
      const excludedTenantIds = asStringArray(config.excludedTenantIds);
      return tenantIds.includes(tenantId) && !excludedTenantIds.includes(tenantId);
    });
    reasons.push({
      code: "FEATURE_FLAGS",
      allowed: featureFlagsSatisfied,
      message: featureFlagsSatisfied
        ? "All required feature flags are enabled for the tenant."
        : "One or more required feature flags are disabled or out of scope.",
      metadata: { requiredFlags },
    });

    const failedDependencies = plugin.dependencies
      .filter((dep: any) => !dep.optional && dep.mustBeActive && dep.dependency.status !== "ACTIVE")
      .map((dep: any) => dep.dependency.pluginKey);
    const dependenciesSatisfied = failedDependencies.length === 0;
    reasons.push({
      code: "DEPENDENCIES",
      allowed: dependenciesSatisfied,
      message: dependenciesSatisfied
        ? "Mandatory plugin dependencies are active."
        : "Mandatory dependencies are unavailable.",
      metadata: { failedDependencies },
    });

    const requiredSettings = plugin.settings.filter((setting: any) => {
      const schema = (setting.schema || {}) as Record<string, unknown>;
      return schema.required === true;
    });
    const values = new Map(
      plugin.settingValues.map((value: any) => [
        `${value.scope}:${value.tenantId || ""}:${value.settingKey}`,
        value.value,
      ])
    );
    const missingSettings = requiredSettings
      .filter((setting: any) => {
        if (setting.scope === "TENANT") {
          return !values.has(`TENANT:${tenantId}:${setting.settingKey}`) && setting.defaultValue == null;
        }
        return !values.has(`GLOBAL::${setting.settingKey}`) && setting.defaultValue == null;
      })
      .map((setting: any) => setting.settingKey);
    const configurationSatisfied = missingSettings.length === 0;
    reasons.push({
      code: "CONFIGURATION",
      allowed: configurationSatisfied,
      message: configurationSatisfied
        ? "Required plugin configuration is available."
        : "Required plugin configuration is incomplete.",
      metadata: { missingSettings },
    });

    const value: PluginEffectiveAccess = {
      pluginKey,
      tenantId,
      allowed:
        pluginStatusAllowed &&
        assignmentEnabled &&
        subscriptionSatisfied &&
        featureFlagsSatisfied &&
        dependenciesSatisfied &&
        configurationSatisfied,
      evaluatedAt: new Date().toISOString(),
      cacheTtlSeconds: TTL_SECONDS,
      pluginStatus: plugin.status,
      assignmentEnabled,
      subscriptionSatisfied,
      featureFlagsSatisfied,
      dependenciesSatisfied,
      configurationSatisfied,
      reasons,
    };

    cache.set(key, { expiresAt: Date.now() + TTL_SECONDS * 1000, value });
    return value;
  }

  async matrix(tenantId: string) {
    const plugins = await (prisma as any).plugin.findMany({
      where: { status: { not: "UNINSTALLED" } },
      select: { pluginKey: true },
      orderBy: { pluginKey: "asc" },
    });
    return Promise.all(plugins.map((plugin: any) => this.evaluate(plugin.pluginKey, tenantId)));
  }
}

export const pluginAccessService = new PluginAccessService();
