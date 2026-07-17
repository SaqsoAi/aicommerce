import prisma from "../../config/prisma";
import { pluginAccessService } from "./plugin-platform.access.service";
import { pluginRegistryService } from "./plugin-platform.registry.service";
import { pluginConfigurationService } from "./plugin-platform.configuration.service";
import { pluginPlatformService } from "./plugin-platform.service";
import { pluginHealthSchedulerAdapter } from "./plugin-platform.health-scheduler.adapter";
import type {
  PluginHealthOrchestrationResult,
  PluginHealthSignal,
  PluginPlatformHealthSnapshot,
  PluginRecoveryRecommendation,
} from "./plugin-platform.health-orchestrator.types";

function fail(code: string, message: string, statusCode = 422): never {
  throw Object.assign(new Error(message), { code, statusCode });
}

function reasonOf(value: unknown): string {
  const reason = String(value || "").trim();
  if (reason.length < 5) {
    fail("PLUGIN_HEALTH_REASON_REQUIRED", "A reason of at least 5 characters is required");
  }
  return reason.slice(0, 500);
}

function signal(
  key: string,
  category: PluginHealthSignal["category"],
  status: PluginHealthSignal["status"],
  message: string,
  metadata?: Record<string, unknown>
): PluginHealthSignal {
  return { key, category, status, message, metadata };
}

function recommendation(
  code: PluginRecoveryRecommendation["code"],
  severity: PluginRecoveryRecommendation["severity"],
  message: string,
  automaticEligible = false,
  destructive = false
): PluginRecoveryRecommendation {
  return { code, severity, message, automaticEligible, destructive };
}

export class PluginHealthOrchestratorService {
  async evaluate(pluginKey: string): Promise<PluginHealthOrchestrationResult> {
    const plugin = await (prisma as any).plugin.findUnique({
      where: { pluginKey },
      include: {
        healthChecks: true,
        dependencies: { include: { dependency: true } },
        tenantAccess: true,
        installations: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!plugin) fail("PLUGIN_NOT_FOUND", "Plugin not found", 404);

    const signals: PluginHealthSignal[] = [];
    const recommendations: PluginRecoveryRecommendation[] = [];

    if (plugin.status !== "ACTIVE") {
      signals.push(signal(
        "plugin.status",
        "DECLARED_CHECK",
        "WARN",
        `Plugin is ${plugin.status}; active tenant delivery is disabled.`
      ));
    } else {
      signals.push(signal(
        "plugin.status",
        "DECLARED_CHECK",
        "PASS",
        "Plugin is globally active."
      ));
    }

    for (const check of plugin.healthChecks || []) {
      const current = String(check.lastStatus || "PENDING").toUpperCase();
      signals.push(signal(
        `declared.${check.checkKey}`,
        "DECLARED_CHECK",
        current === "PASSED" || current === "PASS"
          ? "PASS"
          : current === "FAILED" || current === "FAIL"
            ? "FAIL"
            : "WARN",
        check.lastMessage || `Declared check status: ${current}`,
        { required: check.required, type: check.type }
      ));
    }

    const failedDependencies = (plugin.dependencies || []).filter(
      (item: any) =>
        !item.optional &&
        item.mustBeActive &&
        item.dependency.status !== "ACTIVE"
    );

    signals.push(signal(
      "dependencies",
      "DEPENDENCY",
      failedDependencies.length ? "FAIL" : "PASS",
      failedDependencies.length
        ? `${failedDependencies.length} mandatory dependencies are unavailable.`
        : "Mandatory dependencies are active.",
      { plugins: failedDependencies.map((item: any) => item.dependency.pluginKey) }
    ));

    const registry = await pluginRegistryService.snapshot();
    const registryIssues = registry.issues.filter(
      (item) => item.pluginKey === pluginKey
    );
    signals.push(signal(
      "registry",
      "REGISTRY",
      registryIssues.some((item) => item.severity === "ERROR")
        ? "FAIL"
        : registryIssues.length
          ? "WARN"
          : "PASS",
      registryIssues.length
        ? `${registryIssues.length} registry issues detected.`
        : "Registry entries are healthy.",
      { issues: registryIssues }
    ));

    const failedTransactions = (plugin.transactions || []).filter(
      (item: any) =>
        ["FAILED", "ROLLED_BACK", "ROLLING_BACK"].includes(item.status)
    );
    signals.push(signal(
      "transactions",
      "TRANSACTION",
      failedTransactions.length ? "FAIL" : "PASS",
      failedTransactions.length
        ? `${failedTransactions.length} recent installation transactions failed or rolled back.`
        : "Recent installation transactions are healthy."
    ));

    const config = await pluginConfigurationService.document(pluginKey);
    signals.push(signal(
      "configuration",
      "CONFIGURATION",
      config.complete ? "PASS" : "WARN",
      config.complete
        ? "Required global configuration is complete."
        : `${config.missingRequired.length} required settings are missing.`,
      { missing: config.missingRequired }
    ));

    let affectedTenantCount = 0;
    for (const access of plugin.tenantAccess || []) {
      if (!access.enabled) continue;
      try {
        const effective = await pluginAccessService.evaluate(
          pluginKey,
          access.tenantId,
          true
        );
        if (!effective.allowed) affectedTenantCount += 1;
      } catch {
        affectedTenantCount += 1;
      }
    }

    signals.push(signal(
      "tenant-impact",
      "TENANT_IMPACT",
      affectedTenantCount ? "WARN" : "PASS",
      affectedTenantCount
        ? `${affectedTenantCount} assigned tenants currently fail effective-access gates.`
        : "No assigned tenant impact detected.",
      { affectedTenantCount }
    ));

    const failureCount = signals.filter((item) => item.status === "FAIL").length;
    const warningCount = signals.filter((item) => item.status === "WARN").length;
    const score = Math.max(0, 100 - failureCount * 25 - warningCount * 8);

    const auditFailures = await (prisma as any).pluginAuditEvent.count({
      where: {
        pluginId: plugin.id,
        outcome: "FAILED",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const quarantineRecommended =
      failureCount >= 2 ||
      auditFailures >= 3 ||
      failedTransactions.length >= 2;

    if (failureCount === 0 && warningCount === 0) {
      recommendations.push(
        recommendation("NO_ACTION", "INFO", "No recovery action is required.")
      );
    } else {
      recommendations.push(
        recommendation(
          "RETRY_HEALTH",
          failureCount ? "WARNING" : "INFO",
          "Run the controlled health checks again after reviewing recent changes.",
          true,
          false
        )
      );
    }

    if (!config.complete) {
      recommendations.push(
        recommendation(
          "REVIEW_CONFIGURATION",
          "WARNING",
          "Complete required plugin configuration."
        )
      );
    }
    if (failedDependencies.length) {
      recommendations.push(
        recommendation(
          "REVIEW_DEPENDENCY",
          "CRITICAL",
          "Restore mandatory plugin dependencies before activation."
        )
      );
    }
    if (registryIssues.length) {
      recommendations.push(
        recommendation(
          "REVIEW_REGISTRY",
          registryIssues.some((item) => item.severity === "ERROR")
            ? "CRITICAL"
            : "WARNING",
          "Resolve registry collisions or unapproved adapters."
        )
      );
    }
    if (failedTransactions.length) {
      recommendations.push(
        recommendation(
          "REVIEW_TRANSACTION",
          "CRITICAL",
          "Review transaction rollback and file-operation logs."
        )
      );
    }
    if (quarantineRecommended && plugin.status === "ACTIVE") {
      recommendations.push(
        recommendation(
          "QUARANTINE_PLUGIN",
          "CRITICAL",
          "Quarantine is recommended. This requires an explicit SUPER_ADMIN action and reason.",
          false,
          true
        )
      );
    }

    return {
      pluginKey,
      pluginName: plugin.name,
      pluginStatus: plugin.status,
      healthStatus:
        plugin.status !== "ACTIVE"
          ? "INACTIVE"
          : quarantineRecommended
            ? "QUARANTINE_RECOMMENDED"
            : failureCount
              ? "UNHEALTHY"
              : warningCount
                ? "DEGRADED"
                : "HEALTHY",
      score,
      evaluatedAt: new Date().toISOString(),
      consecutiveFailureEstimate: Math.max(auditFailures, failedTransactions.length),
      affectedTenantCount,
      signals,
      recommendations,
    };
  }

  async run(pluginKey: string, actorId: string, reasonValue: unknown) {
    const reason = reasonOf(reasonValue);

    await pluginPlatformService.runHealth(pluginKey, actorId);
    const result = await this.evaluate(pluginKey);

    const plugin = await (prisma as any).plugin.findUnique({
      where: { pluginKey },
      select: { id: true },
    });

    if (plugin) {
      await (prisma as any).pluginAuditEvent.create({
        data: {
          pluginId: plugin.id,
          actorId,
          action: "PLUGIN_HEALTH_ORCHESTRATED",
          outcome:
            result.healthStatus === "HEALTHY"
              ? "SUCCESS"
              : result.healthStatus === "DEGRADED"
                ? "WARNING"
                : "FAILED",
          reason,
          metadata: {
            score: result.score,
            healthStatus: result.healthStatus,
            affectedTenantCount: result.affectedTenantCount,
          },
        },
      });
    }

    return result;
  }

  async platformSnapshot(refresh = false): Promise<PluginPlatformHealthSnapshot> {
    if (refresh) {
      pluginRegistryService.invalidate();
    }

    const plugins = await (prisma as any).plugin.findMany({
      where: { status: { not: "UNINSTALLED" } },
      select: { pluginKey: true },
      orderBy: { pluginKey: "asc" },
    });

    const results = [];
    for (const plugin of plugins) {
      results.push(await this.evaluate(plugin.pluginKey));
    }

    return {
      generatedAt: new Date().toISOString(),
      scheduler: {
        enabled: false,
        mode: "MANUAL_ONLY",
        reason:
          "No canonical scheduler/worker owner was confirmed by the P13 source-state audit.",
      },
      summary: {
        total: results.length,
        healthy: results.filter((item) => item.healthStatus === "HEALTHY").length,
        degraded: results.filter((item) => item.healthStatus === "DEGRADED").length,
        unhealthy: results.filter((item) => item.healthStatus === "UNHEALTHY").length,
        quarantineRecommended: results.filter(
          (item) => item.healthStatus === "QUARANTINE_RECOMMENDED"
        ).length,
        affectedTenants: results.reduce(
          (sum, item) => sum + item.affectedTenantCount,
          0
        ),
      },
      plugins: results,
    };
  }

  async quarantine(
    pluginKey: string,
    actorId: string,
    reasonValue: unknown
  ) {
    const reason = reasonOf(reasonValue);
    const current = await this.evaluate(pluginKey);

    if (current.healthStatus !== "QUARANTINE_RECOMMENDED") {
      fail(
        "PLUGIN_QUARANTINE_NOT_RECOMMENDED",
        "Current health state does not meet quarantine policy"
      );
    }

    const plugin = await (prisma as any).plugin.findUnique({
      where: { pluginKey },
    });
    if (!plugin) fail("PLUGIN_NOT_FOUND", "Plugin not found", 404);
    if (plugin.status !== "ACTIVE") {
      fail("PLUGIN_QUARANTINE_STATE", "Only active plugins can be quarantined");
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.plugin.update({
        where: { id: plugin.id },
        data: { status: "INACTIVE" },
      });

      await tx.pluginTenantAccess.updateMany({
        where: { pluginId: plugin.id, enabled: true },
        data: { enabled: false },
      });

      await tx.pluginAuditEvent.create({
        data: {
          pluginId: plugin.id,
          actorId,
          action: "PLUGIN_QUARANTINED",
          outcome: "SUCCESS",
          reason,
          metadata: {
            previousStatus: plugin.status,
            healthScore: current.score,
            policy: "manual-super-admin",
          },
        },
      });
    });

    pluginAccessService.invalidate(pluginKey);
    pluginRegistryService.invalidate();

    return this.evaluate(pluginKey);
  }

  schedulerState() {
    return {
      key: pluginHealthSchedulerAdapter.key,
      enabled: pluginHealthSchedulerAdapter.enabled,
      mode: "MANUAL_ONLY",
    };
  }
}

export const pluginHealthOrchestratorService =
  new PluginHealthOrchestratorService();
