import type { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";

type JsonRecord = Record<string, unknown>;
type Insight = { title: string; detail: string; severity: string; source: string; capturedAt: string };

const emptyProjectTelemetry = {
  healthScore: null as number | null,
  criticalBugs: null as number | null,
  mediumBugs: null as number | null,
  lowPriority: null as number | null,
  performanceScore: null as number | null,
  securityScore: null as number | null,
  buildStatus: null as string | null,
  testCoverage: null as number | null,
  codeQuality: null as string | null,
  techDebt: null as number | null,
  duplicateCode: null as number | null,
  unusedFiles: null as number | null,
  dependencies: null as number | null,
  dependencyLabel: null as string | null,
  overview: {
    totalModules: null as number | null,
    totalApis: null as number | null,
    databaseTables: null as number | null,
    reactComponents: null as number | null,
    linesOfCode: null as number | null,
    teamMembers: null as number | null,
    commitsThisWeek: null as number | null,
    activeBranch: null as string | null,
  },
  history: [] as Array<{ label: string; commits?: number; issues?: number; pullRequests?: number; codeReviews?: number }>,
  insights: [] as Insight[],
  sources: [] as Array<{ kind: string; source: string; capturedAt: string }>,
};

function record(value: Prisma.JsonValue | undefined): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function finite(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number.NaN;
  return Number.isFinite(number) ? number : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function issueValue(payload: JsonRecord, key: "critical" | "medium" | "low"): number | null {
  const issues = record(payload.issues as Prisma.JsonValue | undefined);
  return finite(issues[key]);
}

function gradeScore(grade: string | null): number | null {
  return grade ? ({ A: 95, B: 85, C: 70, D: 55, F: 25 } as Record<string, number>)[grade] ?? null : null;
}

function computeHealth(values: { performance: number | null; security: number | null; coverage: number | null; grade: string | null; build: string | null; critical: number | null; medium: number | null; low: number | null }) {
  const signals = [
    values.performance == null ? null : { value: values.performance, weight: 0.25 },
    values.security == null ? null : { value: values.security, weight: 0.25 },
    values.coverage == null ? null : { value: values.coverage, weight: 0.2 },
    gradeScore(values.grade) == null ? null : { value: gradeScore(values.grade) as number, weight: 0.2 },
    values.build == null ? null : { value: values.build === "SUCCESS" ? 100 : values.build === "RUNNING" ? 70 : values.build === "CANCELLED" ? 40 : 0, weight: 0.1 },
  ].filter((item): item is { value: number; weight: number } => item !== null);

  // A health score is intentionally withheld until at least three independent
  // signal groups exist. This prevents a misleading score from sparse data.
  if (signals.length < 3) return null;
  const weighted = signals.reduce((sum, item) => sum + item.value * item.weight, 0) / signals.reduce((sum, item) => sum + item.weight, 0);
  const penalty = Math.min(30, (values.critical || 0) * 10 + (values.medium || 0) * 3 + (values.low || 0));
  return Math.max(0, Math.min(100, Math.round(weighted - penalty)));
}

export async function getProjectTelemetry(projectKey = "default") {
  try {
    const rows = await prisma.projectTelemetrySnapshot.findMany({ where: { projectKey }, orderBy: { capturedAt: "desc" }, take: 200 });
    const latest = new Map<string, (typeof rows)[number]>();
    for (const row of rows) if (!latest.has(row.kind)) latest.set(row.kind, row);

    const build = record(latest.get("BUILD")?.payload);
    const quality = record(latest.get("CODE_QUALITY")?.payload);
    const security = record(latest.get("SECURITY")?.payload);
    const performance = record(latest.get("PERFORMANCE")?.payload);
    const repository = record(latest.get("REPOSITORY")?.payload);

    const critical = issueValue(quality, "critical") ?? finite(repository.criticalIssues);
    const medium = issueValue(quality, "medium") ?? finite(repository.mediumIssues);
    const low = issueValue(quality, "low") ?? finite(repository.lowIssues);
    const performanceScore = finite(performance.score) ?? finite(repository.performanceScore);
    const securityScore = finite(security.score) ?? finite(repository.securityScore);
    const testCoverage = finite(build.testCoverage) ?? finite(repository.testCoverage);
    const codeQuality = text(quality.grade) ?? text(repository.qualityGrade);
    const buildStatus = text(build.status) ?? text(repository.buildStatus);
    const dependencyUpdates = finite(repository.dependencyUpdates);
    const dependencyCount = finite(repository.dependencyCount);

    const insights: Insight[] = [];
    for (const row of latest.values()) {
      const payload = record(row.payload);
      if (!Array.isArray(payload.insights)) continue;
      for (const raw of payload.insights) {
        const item = record(raw as Prisma.JsonValue);
        const title = text(item.title);
        if (title) insights.push({ title, detail: text(item.detail) || "", severity: text(item.severity) || "INFO", source: row.source, capturedAt: row.capturedAt.toISOString() });
      }
    }

    const history = Array.isArray(repository.history) ? repository.history.flatMap((raw) => {
      const item = record(raw as Prisma.JsonValue);
      const label = text(item.label);
      return label ? [{ label, commits: finite(item.commits) ?? undefined, issues: finite(item.issues) ?? undefined, pullRequests: finite(item.pullRequests) ?? undefined, codeReviews: finite(item.codeReviews) ?? undefined }] : [];
    }) : [];

    return {
      ...emptyProjectTelemetry,
      healthScore: computeHealth({ performance: performanceScore, security: securityScore, coverage: testCoverage, grade: codeQuality, build: buildStatus, critical, medium, low }),
      criticalBugs: critical,
      mediumBugs: medium,
      lowPriority: low,
      performanceScore,
      securityScore,
      buildStatus,
      testCoverage,
      codeQuality,
      techDebt: finite(quality.technicalDebtPercent) ?? finite(repository.technicalDebtPercent),
      duplicateCode: finite(quality.duplicateCodePercent) ?? finite(repository.duplicateCodePercent),
      unusedFiles: finite(quality.unusedFiles) ?? finite(repository.unusedFiles),
      dependencies: dependencyUpdates ?? dependencyCount,
      dependencyLabel: dependencyUpdates == null && dependencyCount != null ? "Packages" : "Updates",
      overview: {
        totalModules: finite(quality.modules) ?? finite(repository.modules),
        totalApis: finite(quality.apis) ?? finite(repository.apis),
        databaseTables: finite(quality.databaseTables) ?? finite(repository.databaseTables),
        reactComponents: finite(quality.reactComponents) ?? finite(repository.reactComponents),
        linesOfCode: finite(quality.linesOfCode) ?? finite(repository.linesOfCode),
        teamMembers: finite(quality.teamMembers) ?? finite(repository.teamMembers),
        commitsThisWeek: finite(repository.commitsThisWeek),
        activeBranch: text(repository.activeBranch) || latest.get("REPOSITORY")?.branch || null,
      },
      history,
      insights: insights.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt)).slice(0, 8),
      sources: Array.from(latest.values()).map((row) => ({ kind: row.kind, source: row.source, capturedAt: row.capturedAt.toISOString() })),
    };
  } catch (error) {
    // Allows the additive migration to be deployed independently. Missing table
    // or unavailable database never produces fabricated dashboard values.
    console.error("project telemetry dashboard unavailable", { projectKey, error });
    return { ...emptyProjectTelemetry, overview: { ...emptyProjectTelemetry.overview }, history: [], insights: [], sources: [] };
  }
}
