import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import type { CopilotRequest, CopilotResponse, ImpactAnalysis, ProjectIndexSummary, SafeExecutionSandboxPlan } from "./types";

type GatewayLike = (payload: Record<string, unknown>) => Promise<unknown>;

export function sanitizeCopilotText(input: string): string {
  return input
    .replace(/(DATABASE_URL|DIRECT_URL|JWT_SECRET|API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*[^\s]+/gi, "$1=[REDACTED]")
    .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://[REDACTED]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[REDACTED]");
}

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".prisma"]);
const SKIPPED_DIRECTORIES = new Set(["node_modules", "dist", "build", ".next", ".git", ".turbo", "uploads", "AI-CommerceLIVE", "PROJECT_AUDIT"]);

function resolveWorkspaceRoot(input: string): string {
  const resolved = path.resolve(input);
  if (fs.existsSync(path.join(resolved, "server", "src"))) return resolved;
  if (path.basename(resolved).toLowerCase() === "server" && fs.existsSync(path.join(resolved, "src"))) return path.dirname(resolved);
  return resolved;
}

function gitText(workspaceRoot: string, args: string[]): string | null {
  try {
    const output = execFileSync("git", ["-C", workspaceRoot, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 8_000,
    }).trim();
    return output || null;
  } catch {
    return null;
  }
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
  const workspaceRoot = resolveWorkspaceRoot(projectRoot);
  const roots = ["server/src", "server/prisma", "admin/src", "client/src"]
    .map((entry) => path.join(workspaceRoot, entry))
    .filter((entry) => fs.existsSync(entry));
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
  let totalApis = 0;
  let linesOfCode = 0;
  let reactComponents = 0;
  let criticalIssues = 0;
  let mediumIssues = 0;
  let lowIssues = 0;
  let performanceFindings = 0;
  let securityFindings = 0;
  let debtMarkers = 0;
  let unusedFiles = 0;
  const normalizedLineCounts = new Map<string, number>();
  const sourceNames = new Map<string, string>();
  const sourceTextParts: string[] = [];

  const walk = (dir: string) => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIPPED_DIRECTORIES.has(item.name)) continue;
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
      if (normalized.endsWith(".tsx")) reactComponents += 1;
      if (normalized.includes("template")) templates += 1;
      if (normalized.includes("/ai/")) aiModules += 1;
      if (normalized.endsWith(".prisma")) prismaFiles += 1;
      const extension = path.extname(full).toLowerCase();
      if (!SOURCE_EXTENSIONS.has(extension)) continue;
      const contents = fs.readFileSync(full, "utf8");
      sourceTextParts.push(contents);
      linesOfCode += contents.split(/\r?\n/).filter((line) => line.trim()).length;
      const todoCount = (contents.match(/\b(?:TODO|FIXME|HACK)\b/gi) || []).length;
      const consoleCount = (contents.match(/\bconsole\.(?:log|warn|error)\s*\(/g) || []).length;
      const looseAnyCount = (contents.match(/:\s*any\b|as\s+any\b/g) || []).length;
      const securityCount = (contents.match(/sk-[A-Za-z0-9_-]{20,}|password\s*[:=]\s*["'][^"']{8,}["']|secret\s*[:=]\s*["'][^"']{8,}["']/gi) || []).length;
      const performanceCount = (contents.match(/\bfor\s*\([^)]*\)\s*\{[\s\S]{0,240}\bawait\b/g) || []).length;
      debtMarkers += todoCount;
      securityFindings += securityCount;
      performanceFindings += performanceCount;
      criticalIssues += securityCount;
      mediumIssues += todoCount + performanceCount;
      lowIssues += consoleCount + looseAnyCount;
      for (const line of contents.split(/\r?\n/)) {
        const normalizedLine = line.trim().replace(/\s+/g, " ");
        if (normalizedLine.length < 80) continue;
        normalizedLineCounts.set(normalizedLine, (normalizedLineCounts.get(normalizedLine) || 0) + 1);
      }
      const baseName = path.basename(full, extension);
      if (/\.(?:tsx|jsx)$/i.test(full) && /^[A-Z]/.test(baseName)) sourceNames.set(full, baseName);
      if (/\.routes?\.[jt]s$/i.test(full) || normalized.endsWith("/app.ts")) {
        totalApis += (contents.match(/\b(?:router|app)\.(?:get|post|put|patch|delete|use)\s*\(/g) || []).length;
      }
    }
  };
  roots.forEach(walk);

  const modulesRoot = path.join(workspaceRoot, "server", "src", "modules");
  const totalModules = fs.existsSync(modulesRoot)
    ? fs.readdirSync(modulesRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length
    : 0;
  const schemaPath = path.join(workspaceRoot, "server", "prisma", "schema.prisma");
  const databaseTables = fs.existsSync(schemaPath)
    ? (fs.readFileSync(schemaPath, "utf8").match(/^model\s+\w+\s*\{/gm) || []).length
    : 0;
  const activeBranch = gitText(workspaceRoot, ["branch", "--show-current"]);
  const commits = gitText(workspaceRoot, ["log", "--since=7.days", "--format=%H"]);
  const commitsThisWeek = commits ? commits.split(/\r?\n/).filter(Boolean).length : 0;
  const contributors = gitText(workspaceRoot, ["shortlog", "-sne", "--all"]);
  const teamMembers = contributors ? contributors.split(/\r?\n/).filter(Boolean).length : 0;
  const combinedSourceText = sourceTextParts.join("\n");
  for (const [file, baseName] of sourceNames) {
    const importUse = new RegExp(`(?:import\\s+[^;]*\\b${baseName}\\b|<${baseName}\\b)`, "g");
    const occurrences = (combinedSourceText.match(importUse) || []).length;
    if (occurrences <= 1 && !file.replace(/\\/g, "/").includes("/app/")) unusedFiles += 1;
  }
  const duplicatedLines = Array.from(normalizedLineCounts.values()).reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  const duplicateCodePercent = Math.min(100, Math.round((duplicatedLines / Math.max(1, linesOfCode)) * 100));
  const technicalDebtPercent = Math.min(100, Math.round(((debtMarkers + duplicatedLines) / Math.max(1, linesOfCode)) * 100));
  const performanceScore = Math.max(0, Math.min(100, 100 - performanceFindings * 5 - duplicateCodePercent));
  const securityScore = Math.max(0, Math.min(100, 100 - securityFindings * 25));
  const qualityPenalty = criticalIssues * 25 + mediumIssues * 3 + Math.min(40, lowIssues);
  const codeQualityGrade: ProjectIndexSummary["codeQualityGrade"] = qualityPenalty <= 5 ? "A" : qualityPenalty <= 20 ? "B" : qualityPenalty <= 45 ? "C" : qualityPenalty <= 80 ? "D" : "F";
  const packageFiles = ["server/package.json", "admin/package.json", "client/package.json"]
    .map((entry) => path.join(workspaceRoot, entry))
    .filter((entry) => fs.existsSync(entry));
  const dependencyCount = packageFiles.reduce((sum, file) => {
    try {
      const pkg = JSON.parse(fs.readFileSync(file, "utf8")) as { dependencies?: Record<string, unknown>; devDependencies?: Record<string, unknown> };
      return sum + Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length;
    } catch {
      return sum;
    }
  }, 0);
  const history = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - offset));
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const dayCommits = gitText(workspaceRoot, ["rev-list", "--count", `--since=${date.toISOString()}`, `--before=${next.toISOString()}`, "HEAD"]);
    return { label: date.toLocaleDateString("en-US", { weekday: "short" }), commits: Number.parseInt(dayCommits || "0", 10) || 0 };
  });

  return {
    folders,
    files,
    routes,
    controllers,
    services,
    middleware,
    components,
    templates,
    aiModules,
    prismaFiles,
    totalModules,
    totalApis,
    databaseTables,
    reactComponents,
    linesOfCode,
    teamMembers,
    commitsThisWeek,
    activeBranch,
    history,
    buildStatus: "INDEXED",
    testCoverage: 0,
    codeQualityGrade,
    criticalIssues,
    mediumIssues,
    lowIssues,
    performanceFindings,
    securityFindings,
    performanceScore,
    securityScore,
    technicalDebtPercent,
    duplicateCodePercent,
    unusedFiles,
    dependencyUpdates: 0,
    dependencyCount,
  };
}

function buildModeSpecificPreview(req: CopilotRequest, prompt: string, index: ProjectIndexSummary): Pick<CopilotResponse, "summary" | "recommendations" | "patchPreview"> {
  const mode = String(req.mode || "review").toLowerCase();
  const repositoryLine = `${index.totalModules} server modules, ${index.totalApis} API routes, ${index.databaseTables} Prisma models, ${index.reactComponents} React components, and ${index.linesOfCode.toLocaleString("en-US")} source lines were indexed from the development workspace.`;
  const scannerLine = "Build, security, performance, and coverage scores require real telemetry snapshots; unavailable scanner metrics were not estimated.";

  if (mode === "analyze") {
    return {
      summary: `Project analysis prepared from live repository telemetry. ${repositoryLine}`,
      recommendations: [
        "Keep dashboard cards bound to repository telemetry, AuditLog, AILog, and explicit scanner snapshots only.",
        scannerLine,
        "Review Platform Overview Activity rows when telemetry volume grows so long audit messages remain readable.",
        "Run admin build, server typecheck, and dashboard Playwright visual checks after any approved change.",
      ],
      patchPreview: "NO_PATCH_APPLIED: analysis-only preview generated from current project index.",
    };
  }

  if (mode === "fix") {
    return {
      summary: `Bug review preview prepared for: ${prompt || "current dashboard state"}. ${scannerLine}`,
      recommendations: [
        "Confirm the failing UI state with a screenshot or Playwright clipping gate before patching.",
        "Patch the existing owner component/CSS only; do not create duplicate dashboards or demo fallbacks.",
        "Use AuditLog/AILog entries as real activity/conversation sources after the fix.",
        "Validate the exact role views affected by the bug before handoff.",
      ],
      patchPreview: "NO_PATCH_APPLIED: bug-fix preview requires explicit approval before code changes.",
    };
  }

  if (mode === "performance") {
    return {
      summary: `Performance preview prepared from available telemetry. Runtime values can be shown only when the dashboard API returns live process metrics.` ,
      recommendations: [
        "Keep dashboard rendering compact and avoid fixed-height clipping on panels with real rows.",
        "Use persisted telemetry snapshots for trend charts instead of synthetic client-side samples.",
        "Measure API response time and database query latency before claiming performance scores.",
        "Run dashboard responsive Playwright checks after layout changes because overflow is the most visible risk here.",
      ],
      patchPreview: "NO_PATCH_APPLIED: performance preview only; no optimization was applied.",
    };
  }

  if (mode === "docs") {
    return {
      summary: "Documentation preview prepared for the current dashboard/Copilot behavior.",
      recommendations: [
        `Document the real source map: repository index (${index.totalModules} modules), ProjectTelemetrySnapshot, AuditLog, and AILog.`,
        "State that missing scanner snapshots render Unavailable by design.",
        "Include validation commands and Playwright role coverage in the phase report.",
        "Keep production sync status explicit when the user excludes production.",
      ],
      patchPreview: "NO_PATCH_APPLIED: documentation preview only; no docs file was generated automatically.",
    };
  }

  if (mode === "feature") {
    return {
      summary: `Feature planning preview prepared with approval gates. ${repositoryLine}`,
      recommendations: [
        "Start with database/API ownership if the feature needs new real data.",
        "Add admin UI only after the API contract is known and permission/RBAC impact is checked.",
        "Back up affected files before implementation and keep changes inside existing owner files.",
        "Require build and Playwright evidence before production sync or git push.",
      ],
      patchPreview: "NO_PATCH_APPLIED: feature plan only; implementation requires approval.",
    };
  }

  return {
    summary: `Code review preview prepared from live repository context. ${repositoryLine}`,
    recommendations: [
      "Inspect exact owner files before any patch.",
      "Generate diff preview only; require Super Admin approval before apply.",
      "Run server typecheck, server build, admin build, client build, and dashboard Playwright checks after approved changes.",
      "Do not expose secrets, run migrations, deploy, or git push from Copilot actions.",
    ],
    patchPreview: "NO_PATCH_APPLIED: review preview generated from current project index.",
  };
}

export async function generateCopilotPreview(req: CopilotRequest, aiGateway?: GatewayLike): Promise<CopilotResponse> {
  const prompt = sanitizeCopilotText(req.prompt || "").trim();
  const impact = inferImpact(prompt);
  const sandbox = createSafeExecutionSandboxPlan();
  const index = buildProjectIndexSummary(process.cwd());
  const preview = buildModeSpecificPreview(req, prompt, index);

  const baseResponse: CopilotResponse = {
    mode: req.mode,
    role: req.role,
    summary: preview.summary,
    recommendations: preview.recommendations,
    impact,
    patchPreview: preview.patchPreview,
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
