import prisma from "../../config/prisma";
import { pluginConfigurationService } from "./plugin-platform.configuration.service";
import { pluginHealthOrchestratorService } from "./plugin-platform.health-orchestrator.service";
import type {
  PluginGuidance,
  PluginGuidanceState,
} from "./plugin-platform.guidance.types";

function text(value: unknown, max = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return normalized ? normalized.slice(0, max) : undefined;
}

function safeHref(value: unknown): string | undefined {
  const href = text(value, 300);
  if (!href) return undefined;
  if (href.startsWith("/")) return href;
  try {
    const url = new URL(href);
    return ["https:", "http:"].includes(url.protocol) ? href : undefined;
  } catch {
    return undefined;
  }
}

function manifestGuidance(manifest: unknown): Record<string, unknown> {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return {};
  }
  const value = (manifest as Record<string, unknown>).tooltipGuidance;
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export class PluginGuidanceService {
  async list(): Promise<PluginGuidance[]> {
    const plugins = await (prisma as any).plugin.findMany({
      where: { status: { not: "UNINSTALLED" } },
      orderBy: { name: "asc" },
    });

    const rows: PluginGuidance[] = [];
    for (const plugin of plugins) {
      rows.push(await this.build(plugin.pluginKey));
    }
    return rows;
  }

  async build(pluginKey: string): Promise<PluginGuidance> {
    const plugin = await (prisma as any).plugin.findUnique({
      where: { pluginKey },
    });

    if (!plugin) {
      return {
        pluginKey,
        pluginName: pluginKey,
        lifecycleStatus: "NOT_FOUND",
        guidanceState: "NOT_INSTALLED",
        title: "Plugin is not installed",
        summary: "Install a trusted package before configuration or activation.",
        instruction:
          "Open Plugin Manager → Marketplace, authorize a trusted signed package, then complete the controlled installation transaction.",
        action: {
          label: "Open Marketplace",
          instruction: "Select a trusted compatible package.",
          href: "/system/plugin-manager/marketplace",
        },
        blockers: ["Plugin registry record was not found."],
        updatedAt: new Date().toISOString(),
      };
    }

    const [configuration, health] = await Promise.all([
      pluginConfigurationService.document(pluginKey),
      pluginHealthOrchestratorService.evaluate(pluginKey),
    ]);

    const guidance = manifestGuidance(plugin.manifest);
    const blockers = health.signals
      .filter((item) => item.status === "FAIL")
      .map((item) => item.message);

    let guidanceState: PluginGuidanceState;
    if (blockers.length) {
      guidanceState = "BLOCKED";
    } else if (plugin.status === "ACTIVE" && health.healthStatus === "HEALTHY") {
      guidanceState = "ACTIVE";
    } else if (plugin.status === "ACTIVE") {
      guidanceState = "DEGRADED";
    } else if (!configuration.complete) {
      guidanceState = "PENDING_SETUP";
    } else if (plugin.status === "INSTALLED") {
      guidanceState = "READY_TO_ACTIVATE";
    } else {
      guidanceState = "INACTIVE";
    }

    const defaults: Record<
      PluginGuidanceState,
      {
        title: string;
        summary: string;
        instruction: string;
        href?: string;
        label?: string;
      }
    > = {
      NOT_INSTALLED: {
        title: "Plugin is not installed",
        summary: "Install a trusted package first.",
        instruction:
          "Open Marketplace, authorize a signed package and run the controlled installer.",
        href: "/system/plugin-manager/marketplace",
        label: "Open Marketplace",
      },
      PENDING_SETUP: {
        title: "Plugin setup is incomplete",
        summary: `${configuration.missingRequired.length} required configuration field(s) remain.`,
        instruction:
          "Open Plugin Configuration, complete every required field, save with a reason, then run health verification.",
        href: "/system/plugin-manager/configuration",
        label: "Complete Setup",
      },
      READY_TO_ACTIVATE: {
        title: "Plugin is ready to activate",
        summary: "Configuration and health prerequisites are satisfied.",
        instruction:
          "Open the plugin lifecycle controls, review tenant impact and activate with a reason.",
        href: `/system/plugin-manager/${encodeURIComponent(pluginKey)}`,
        label: "Activate Plugin",
      },
      ACTIVE: {
        title: "Plugin is active",
        summary: "The plugin is ready for normal operation.",
        instruction:
          "Use the registered menus, widgets, settings and capabilities. Monitor health and transactions for operational changes.",
        href: `/system/plugin-manager/${encodeURIComponent(pluginKey)}`,
        label: "Operate Plugin",
      },
      INACTIVE: {
        title: "Plugin is inactive",
        summary: "The plugin is installed but tenant delivery is disabled.",
        instruction:
          "Review configuration, dependencies and health. Activate only after every safety gate passes.",
        href: `/system/plugin-manager/${encodeURIComponent(pluginKey)}`,
        label: "Review Plugin",
      },
      DEGRADED: {
        title: "Plugin is active with warnings",
        summary: "Operation is available, but one or more health signals need attention.",
        instruction:
          "Open Health Orchestration, review warnings, run a controlled health check and resolve the recommended actions.",
        href: "/system/plugin-manager/health-orchestration",
        label: "Review Health",
      },
      BLOCKED: {
        title: "Plugin operation is blocked",
        summary: blockers[0] || "A mandatory safety gate failed.",
        instruction:
          "Review dependency, registry, transaction, configuration and health blockers before activation or continued operation.",
        href: "/system/plugin-manager/health-orchestration",
        label: "Resolve Blockers",
      },
    };

    const fallback = defaults[guidanceState];
    const prefix =
      guidanceState === "ACTIVE" || guidanceState === "DEGRADED"
        ? "operate"
        : guidanceState === "BLOCKED"
          ? "blocked"
          : "setup";

    return {
      pluginKey,
      pluginName: plugin.name,
      lifecycleStatus: plugin.status,
      guidanceState,
      title: text(guidance[`${prefix}Title`], 120) || fallback.title,
      summary: text(guidance[`${prefix}Summary`], 300) || fallback.summary,
      instruction:
        text(guidance[`${prefix}Instruction`], 1000) ||
        fallback.instruction,
      documentationHref:
        safeHref(guidance.documentationHref) || fallback.href,
      action: fallback.label
        ? {
            label: text(guidance[`${prefix}ActionLabel`], 80) || fallback.label,
            instruction:
              text(guidance[`${prefix}ActionInstruction`], 300) ||
              fallback.instruction,
            href:
              safeHref(guidance[`${prefix}ActionHref`]) ||
              fallback.href,
          }
        : undefined,
      blockers,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const pluginGuidanceService = new PluginGuidanceService();
