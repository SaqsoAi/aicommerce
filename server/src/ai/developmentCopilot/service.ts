import fs from "fs";
import path from "path";
import type { CopilotRequest, CopilotResponse, ImpactAnalysis, ProjectIndexSummary, SafeExecutionSandboxPlan } from "./types";

type GatewayLike = (payload: Record<string, unknown>) => Promise<unknown>;

function redactSecrets(input: string): string {
  return input
    .replace(/(DATABASE_URL|DIRECT_URL|JWT_SECRET|API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*[^\s]+/gi, "$1=[REDACTED]")
    .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://[REDACTED]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[REDACTED]");
}

function scoreRisk(prompt: string): number {
  const p = prompt.toLowerCase();
  let score = 20;
  if (/(database|schema|prisma|migration|supabase|table)/.test(p)) score += 25;
  if (/(auth|jwt|permission|rbac|secret|token|payment|checkout)/.test(p)) score += 25;
  if (/(delete|drop|overwrite|remove|destructive|deploy|git push)/.test(p)) score += 30;
  return Math.min(100, score);
}

function riskLevel(score: number): ImpactAnalysis["riskLevel"] {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

function inferImpact(prompt: string): ImpactAnalysis {
  const p = prompt.toLowerCase();
  const riskScore = scoreRisk(prompt);
  return {
    affectedTables: /(database|schema|prisma|order|inventory|product|membership|reward|crm)/.test(p) ? ["Requires schema inspection before any change"] : [],
    affectedApis: /(api|route|controller|server|backend)/.test(p) ? ["Server API routes/controllers may be affected"] : [],
    affectedRoutes: /(route|page|admin|client|dashboard)/.test(p) ? ["Admin/client route review required"] : [],
    affectedComponents: /(component|react|ui|layout|card|sidebar|header)/.test(p) ? ["React component review required"] : [],
    affectedTests: ["server typecheck", "server build", "admin build", "client build"],
    affectedPermissions: /(admin|super admin|role|rbac|permission|security)/.test(p) ? ["RBAC and Super Admin permission review required"] : [],
    riskScore,
    riskLevel: riskLevel(riskScore),
    requiresSchemaReview: /(database|schema|prisma|migration|supabase|table)/.test(p),
    requiresApproval: true,
  };
}

export function createSafeExecutionSandboxPlan(): SafeExecutionSandboxPlan {
  return {
    enabled: true,
    workflow: [
      "AI_SUGGESTION",
      "IMPACT_ANALYSIS",
      "RISK_SCORE",
      "PREVIEW_DIFF",
      "BACKUP",
      "DEVELOPMENT_SANDBOX_APPLY",
      "BUILD_TYPECHECK",
      "SUPER_ADMIN_APPROVAL",
      "KEEP_OR_ROLLBACK",
    ],
    destructiveActionsAllowed: false,
    autoApplyAllowed: false,
    autoMigrationAllowed: false,
    autoDeployAllowed: false,
  };
}

export function buildProjectIndexSummary(projectRoot = process.cwd()): ProjectIndexSummary {
  const roots = ["src", "prisma"].map((p) => path.join(projectRoot, p)).filter((p) => fs.existsSync(p));
  let folders = 0;
  let files = 0;
  let routes = 0;
  let controllers = 0;
  let services = 0;
  let middleware = 0;
  let components = 0;
  let templates = 0;
  let aiModules = 0;
  let prismaFiles = 0;

  const walk = (dir: string) => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (["node_modules", "dist", "build", ".next", ".git", ".turbo", "uploads"].includes(item.name)) continue;
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        folders += 1;
        walk(full);
        continue;
      }
      files += 1;
      const normalized = full.replace(/\\/g, "/").toLowerCase();
      if (normalized.includes("route") || normalized.includes("routes")) routes += 1;
      if (normalized.includes("controller")) controllers += 1;
      if (normalized.includes("service")) services += 1;
      if (normalized.includes("middleware")) middleware += 1;
      if (normalized.includes("component") || normalized.endsWith(".tsx")) components += 1;
      if (normalized.includes("template")) templates += 1;
      if (normalized.includes("/ai/")) aiModules += 1;
      if (normalized.endsWith(".prisma")) prismaFiles += 1;
    }
  };
  roots.forEach(walk);
  return { folders, files, routes, controllers, services, middleware, components, templates, aiModules, prismaFiles };
}

export async function generateCopilotPreview(req: CopilotRequest, aiGateway?: GatewayLike): Promise<CopilotResponse> {
  const prompt = redactSecrets(req.prompt || "").trim();
  const impact = inferImpact(prompt);
  const sandbox = createSafeExecutionSandboxPlan();

  const baseResponse: CopilotResponse = {
    mode: req.mode,
    role: req.role,
    summary: "Preview-only AI Development Copilot analysis prepared. No code was applied.",
    recommendations: [
      "Inspect exact owner files before any patch.",
      "Generate diff preview only; require Super Admin approval before apply.",
      "Run server typecheck, server build, admin build, and client build after approved sandbox apply.",
      "Do not expose secrets, do not run migrations, do not deploy, and do not git push from Copilot.",
    ],
    impact,
    patchPreview: "NO_PATCH_APPLIED: Copilot is preview-only in Phase 6.11.",
    sandbox,
    gatewayRouted: false,
    approvalRequired: true,
    autoApplied: false,
  };

  if (!aiGateway) return baseResponse;

  await aiGateway({
    feature: "enterprise_development_copilot",
    mode: req.mode,
    role: req.role,
    prompt,
    impact,
    guardrails: {
      previewOnly: true,
      noAutoApply: true,
      noSecrets: true,
      noMigration: true,
      noDeploy: true,
      approvalRequired: true,
    },
    metadata: { tenantId: req.tenantId, userId: req.userId },
  });

  return { ...baseResponse, gatewayRouted: true };
}
