import type { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { buildProjectIndexSummary } from "../../ai/developmentCopilot";
import type { TelemetryKind } from "./project-telemetry.validation";

const REPOSITORY_SOURCE = "server-project-index";
const REPOSITORY_REFRESH_MS = 15 * 60 * 1000;
let repositoryRefresh: Promise<unknown> | null = null;

function isRecord(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasRepositoryDiagnostics(value: Prisma.JsonValue): boolean {
  return isRecord(value) && typeof value.securityScore === "number" && typeof value.performanceScore === "number" && typeof value.qualityGrade === "string" && Array.isArray(value.findings);
}

export type CreateTelemetryInput = {
  projectKey: string;
  kind: TelemetryKind;
  source: string;
  branch?: string;
  commitSha?: string;
  capturedAt: Date;
  payload: Prisma.InputJsonValue;
  actorId?: string;
};

export async function createTelemetrySnapshot(input: CreateTelemetryInput) {
  return prisma.$transaction(async (tx) => {
    const snapshot = await tx.projectTelemetrySnapshot.create({
      data: {
        projectKey: input.projectKey,
        kind: input.kind,
        source: input.source,
        branch: input.branch,
        commitSha: input.commitSha,
        capturedAt: input.capturedAt,
        payload: input.payload,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: input.actorId,
        action: "TELEMETRY_INGESTED",
        module: "PROJECT_TELEMETRY",
        description: `${input.kind} snapshot received from ${input.source}`,
      },
    });

    return snapshot;
  });
}

export async function ensureRepositoryTelemetrySnapshot(projectKey = "default") {
  if (repositoryRefresh) return repositoryRefresh;

  repositoryRefresh = (async () => {
    const cutoff = new Date(Date.now() - REPOSITORY_REFRESH_MS);
    const current = await prisma.projectTelemetrySnapshot.findFirst({
      where: {
        projectKey,
        kind: "REPOSITORY",
        source: REPOSITORY_SOURCE,
        capturedAt: { gte: cutoff },
      },
      orderBy: { capturedAt: "desc" },
    });
    if (current && hasRepositoryDiagnostics(current.payload)) return current;

    const index = buildProjectIndexSummary();
    return createTelemetrySnapshot({
      projectKey,
      kind: "REPOSITORY",
      source: REPOSITORY_SOURCE,
      branch: index.activeBranch || undefined,
      capturedAt: new Date(),
      payload: {
        activeBranch: index.activeBranch || undefined,
        commitsThisWeek: index.commitsThisWeek,
        dependencyUpdates: index.dependencyUpdates,
        dependencyCount: index.dependencyCount,
        findings: index.findings as unknown as Prisma.InputJsonValue,
        buildStatus: index.buildStatus,
        testCoverage: index.testCoverage,
        qualityGrade: index.codeQualityGrade,
        criticalIssues: index.criticalIssues,
        mediumIssues: index.mediumIssues,
        lowIssues: index.lowIssues,
        performanceFindings: index.performanceFindings,
        securityFindings: index.securityFindings,
        performanceScore: index.performanceScore,
        securityScore: index.securityScore,
        technicalDebtPercent: index.technicalDebtPercent,
        duplicateCodePercent: index.duplicateCodePercent,
        unusedFiles: index.unusedFiles,
        modules: index.totalModules,
        apis: index.totalApis,
        databaseTables: index.databaseTables,
        reactComponents: index.reactComponents,
        linesOfCode: index.linesOfCode,
        teamMembers: index.teamMembers,
        history: index.history,
        insights: [{
          title: "Repository Index Updated",
          detail: `${index.totalModules} modules, ${index.totalApis} API routes and ${index.reactComponents} React components indexed; local scanner found ${index.criticalIssues} critical, ${index.mediumIssues} medium and ${index.lowIssues} low-priority signals.`,
          severity: "SUCCESS",
        }],
      },
    });
  })().finally(() => {
    repositoryRefresh = null;
  });

  return repositoryRefresh;
}

export async function latestTelemetrySnapshots(projectKey: string) {
  const rows = await prisma.projectTelemetrySnapshot.findMany({
    where: { projectKey },
    orderBy: { capturedAt: "desc" },
    take: 200,
  });

  const latest = new Map<string, (typeof rows)[number]>();
  for (const row of rows) if (!latest.has(row.kind)) latest.set(row.kind, row);
  return Array.from(latest.values());
}
