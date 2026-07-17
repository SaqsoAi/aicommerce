import { z } from "zod";

export const telemetryKinds = ["BUILD", "CODE_QUALITY", "SECURITY", "PERFORMANCE", "REPOSITORY"] as const;
export type TelemetryKind = (typeof telemetryKinds)[number];

const optionalScore = z.number().finite().min(0).max(100).optional();
const optionalCount = z.number().int().nonnegative().optional();
const insightSchema = z.object({
  title: z.string().trim().min(1).max(160),
  detail: z.string().trim().max(500).default(""),
  severity: z.enum(["INFO", "SUCCESS", "WARNING", "CRITICAL"]).default("INFO"),
}).strict();

const issueCounts = z.object({
  critical: z.number().int().nonnegative().default(0),
  medium: z.number().int().nonnegative().default(0),
  low: z.number().int().nonnegative().default(0),
}).strict();

export const telemetryEnvelopeSchema = z.object({
  projectKey: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9._-]+$/).default("default"),
  source: z.string().trim().min(1).max(120),
  branch: z.string().trim().min(1).max(200).optional(),
  commitSha: z.string().trim().min(7).max(64).regex(/^[a-fA-F0-9]+$/).optional(),
  capturedAt: z.string().datetime({ offset: true }).optional(),
  payload: z.unknown(),
}).strict();

export const telemetryPayloadSchemas: Record<TelemetryKind, z.ZodType> = {
  BUILD: z.object({
    status: z.enum(["SUCCESS", "FAILED", "RUNNING", "CANCELLED"]),
    testCoverage: optionalScore,
    durationMs: z.number().int().nonnegative().optional(),
    insights: z.array(insightSchema).max(50).optional(),
  }).strict(),
  CODE_QUALITY: z.object({
    grade: z.enum(["A", "B", "C", "D", "F"]).optional(),
    technicalDebtPercent: optionalScore,
    duplicateCodePercent: optionalScore,
    unusedFiles: optionalCount,
    modules: optionalCount,
    apis: optionalCount,
    databaseTables: optionalCount,
    reactComponents: optionalCount,
    linesOfCode: optionalCount,
    teamMembers: optionalCount,
    issues: issueCounts.optional(),
    insights: z.array(insightSchema).max(50).optional(),
  }).strict(),
  SECURITY: z.object({
    score: optionalScore,
    issues: issueCounts.optional(),
    insights: z.array(insightSchema).max(50).optional(),
  }).strict(),
  PERFORMANCE: z.object({
    score: optionalScore,
    insights: z.array(insightSchema).max(50).optional(),
  }).strict(),
  REPOSITORY: z.object({
    activeBranch: z.string().trim().min(1).max(200).optional(),
    commitsThisWeek: optionalCount,
    dependencyUpdates: optionalCount,
    dependencyCount: optionalCount,
    buildStatus: z.enum(["INDEXED"]).optional(),
    testCoverage: optionalScore,
    qualityGrade: z.enum(["A", "B", "C", "D", "F"]).optional(),
    criticalIssues: optionalCount,
    mediumIssues: optionalCount,
    lowIssues: optionalCount,
    performanceFindings: optionalCount,
    securityFindings: optionalCount,
    performanceScore: optionalScore,
    securityScore: optionalScore,
    technicalDebtPercent: optionalScore,
    duplicateCodePercent: optionalScore,
    unusedFiles: optionalCount,
    modules: optionalCount,
    apis: optionalCount,
    databaseTables: optionalCount,
    reactComponents: optionalCount,
    linesOfCode: optionalCount,
    teamMembers: optionalCount,
    history: z.array(z.object({
      label: z.string().trim().min(1).max(40),
      commits: z.number().int().nonnegative().optional(),
      issues: z.number().int().nonnegative().optional(),
      pullRequests: z.number().int().nonnegative().optional(),
      codeReviews: z.number().int().nonnegative().optional(),
    }).strict()).max(31).optional(),
    insights: z.array(insightSchema).max(50).optional(),
  }).strict(),
};
