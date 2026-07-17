export type AiSecurityRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AiSecuritySignalType =
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "JWT"
  | "RBAC"
  | "OWNERSHIP"
  | "API_SECURITY"
  | "FILE_UPLOAD"
  | "SECRETS_EXPOSURE"
  | "RATE_LIMITING"
  | "FRAUD"
  | "SPAM"
  | "BOT"
  | "HEALTH"
  | "AUTOMATION"
  | "INCIDENT";

export type AiExplainableDecision = {
  recommendation: string;
  confidence: number;
  evidence: string[];
  affectedModules: string[];
  affectedFiles: string[];
  affectedTables: string[];
  affectedApis: string[];
  riskLevel: AiSecurityRiskLevel;
  rollbackImpact: string;
  why: string;
  how: string;
  alternative: string;
  autoAction: false;
};

export type AiSecurityAutomationRequest = {
  mode:
    | "SECURITY_CENTER"
    | "FRAUD_DETECTION"
    | "SPAM_DETECTION"
    | "BOT_PROTECTION"
    | "SECURITY_ADVISOR"
    | "WORKFLOW_AUTOMATION"
    | "SCHEDULED_JOBS"
    | "HEALTH_MONITORING"
    | "DECISION_TRACEABILITY"
    | "EXPLAINABILITY"
    | "INCIDENT_CENTER";
  subject?: string;
  signalType?: AiSecuritySignalType;
  evidence?: string[];
  metadata?: Record<string, unknown>;
};

export type AiSecurityAutomationResponse = {
  status: "DRAFT_RECOMMENDATION_ONLY";
  source: "AI_SECURITY_AUTOMATION";
  aiGatewayRequired: true;
  noAutoBlock: true;
  noDestructiveAction: true;
  decision: AiExplainableDecision;
  nextSteps: string[];
  auditTags: string[];
};
