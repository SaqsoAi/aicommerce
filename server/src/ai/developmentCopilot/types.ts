export type CopilotMode =
  | "developer"
  | "architect"
  | "review"
  | "debug"
  | "performance"
  | "security"
  | "planner"
  | "documentation";

export type CopilotRole =
  | "AI_SOFTWARE_ARCHITECT"
  | "AI_FULL_STACK_DEVELOPER"
  | "AI_REACT_DEVELOPER"
  | "AI_BACKEND_DEVELOPER"
  | "AI_DATABASE_ENGINEER"
  | "AI_SECURITY_EXPERT"
  | "AI_PERFORMANCE_ENGINEER"
  | "AI_BUG_DETECTOR"
  | "AI_CODE_REVIEWER"
  | "AI_REFACTORING_EXPERT"
  | "AI_DOCUMENTATION_GENERATOR"
  | "AI_TEST_GENERATOR"
  | "AI_DEVOPS_ENGINEER"
  | "AI_UI_UX_AUDITOR";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ProjectIndexFinding {
  category: "CRITICAL_BUG" | "MEDIUM_BUG" | "LOW_PRIORITY" | "PERFORMANCE" | "SECURITY" | "DUPLICATE_CODE" | "UNUSED_FILE";
  file: string;
  line: number;
  message: string;
  instruction: string;
}

export interface ProjectIndexSummary {
  folders: number;
  files: number;
  routes: number;
  controllers: number;
  services: number;
  middleware: number;
  components: number;
  templates: number;
  aiModules: number;
  prismaFiles: number;
  totalModules: number;
  totalApis: number;
  databaseTables: number;
  reactComponents: number;
  linesOfCode: number;
  teamMembers: number;
  commitsThisWeek: number;
  activeBranch: string | null;
  history: Array<{ label: string; commits: number }>;
  buildStatus: "INDEXED";
  testCoverage: number;
  codeQualityGrade: "A" | "B" | "C" | "D" | "F";
  criticalIssues: number;
  mediumIssues: number;
  lowIssues: number;
  performanceFindings: number;
  securityFindings: number;
  performanceScore: number;
  securityScore: number;
  technicalDebtPercent: number;
  duplicateCodePercent: number;
  unusedFiles: number;
  dependencyUpdates: number;
  dependencyCount: number;
  findings: ProjectIndexFinding[];
}

export interface ImpactAnalysis {
  affectedTables: string[];
  affectedApis: string[];
  affectedRoutes: string[];
  affectedComponents: string[];
  affectedTests: string[];
  affectedPermissions: string[];
  riskScore: number;
  riskLevel: RiskLevel;
  requiresSchemaReview: boolean;
  requiresApproval: true;
}

export interface SafeExecutionSandboxPlan {
  enabled: true;
  workflow: [
    "AI_SUGGESTION",
    "IMPACT_ANALYSIS",
    "RISK_SCORE",
    "PREVIEW_DIFF",
    "BACKUP",
    "DEVELOPMENT_SANDBOX_APPLY",
    "BUILD_TYPECHECK",
    "SUPER_ADMIN_APPROVAL",
    "KEEP_OR_ROLLBACK"
  ];
  destructiveActionsAllowed: false;
  autoApplyAllowed: false;
  autoMigrationAllowed: false;
  autoDeployAllowed: false;
}

export interface CopilotRequest {
  mode: CopilotMode;
  role: CopilotRole;
  prompt: string;
  module?: string;
  tenantId?: string;
  userId?: string;
}

export interface CopilotResponse {
  mode: CopilotMode;
  role: CopilotRole;
  summary: string;
  recommendations: string[];
  impact: ImpactAnalysis;
  patchPreview: string;
  sandbox: SafeExecutionSandboxPlan;
  gatewayRouted: boolean;
  approvalRequired: true;
  autoApplied: false;
}
