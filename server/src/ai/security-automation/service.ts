import type {
  AiSecurityAutomationRequest,
  AiSecurityAutomationResponse,
  AiSecurityRiskLevel,
} from "./types";

const clampConfidence = (value: number): number => Math.max(1, Math.min(99, Math.round(value)));

const normalizeRisk = (evidence: string[] = []): AiSecurityRiskLevel => {
  const text = evidence.join(" ").toLowerCase();
  if (text.includes("secret") || text.includes("private key") || text.includes("jwt_secret")) return "CRITICAL";
  if (text.includes("brute") || text.includes("abuse") || text.includes("fraud") || text.includes("malicious")) return "HIGH";
  if (text.includes("suspicious") || text.includes("spam") || text.includes("crawler")) return "MEDIUM";
  return "LOW";
};

export function createExplainableSecurityDecision(
  request: AiSecurityAutomationRequest,
): AiSecurityAutomationResponse {
  const evidence = request.evidence?.length
    ? request.evidence
    : ["No destructive action executed.", "Recommendation generated for Super Admin review only."];

  const riskLevel = normalizeRisk(evidence);
  const confidenceBase = riskLevel === "CRITICAL" ? 91 : riskLevel === "HIGH" ? 86 : riskLevel === "MEDIUM" ? 76 : 68;

  return {
    status: "DRAFT_RECOMMENDATION_ONLY",
    source: "AI_SECURITY_AUTOMATION",
    aiGatewayRequired: true,
    noAutoBlock: true,
    noDestructiveAction: true,
    decision: {
      recommendation: `Review ${request.mode.replace(/_/g, " ").toLowerCase()} signal${request.subject ? ` for ${request.subject}` : ""}.`,
      confidence: clampConfidence(confidenceBase + Math.min(evidence.length, 6)),
      evidence,
      affectedModules: ["Security", "Audit Logs", "AI Gateway", "Feature Flags", "Development Copilot"],
      affectedFiles: [],
      affectedTables: [],
      affectedApis: ["/api/ai/security-automation/analyze", "/api/ai/security-automation/health"],
      riskLevel,
      rollbackImpact: "None. Recommendation-only workflow; no automatic block, delete, migration, deploy, git push, or data mutation.",
      why: "The platform requires explainable AI decisions with evidence, confidence, risk level, affected assets, and rollback impact.",
      how: "Signals are normalized into a traceable recommendation object before any AI Gateway draft generation or Super Admin review.",
      alternative: "Keep monitoring and re-evaluate after additional audit signals are collected.",
      autoAction: false,
    },
    nextSteps: [
      "Review evidence in Super Admin locked UI.",
      "Confirm affected modules and risk score.",
      "Approve manual action only if policy allows.",
      "Create rollback note before any future patch.",
    ],
    auditTags: ["PHASE_6_12", "XAI", "DECISION_TRACEABILITY", "RECOMMENDATION_ONLY"],
  };
}

export function getAiSecurityAutomationHealth() {
  return {
    status: "ok",
    module: "ai-security-automation",
    explainableAi: true,
    decisionTraceability: true,
    autoBlock: false,
    destructiveActions: false,
    requiresAiGateway: true,
  };
}
