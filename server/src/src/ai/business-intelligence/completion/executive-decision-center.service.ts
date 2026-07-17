type DecisionInput = {
  title?: string;
  recommendation?: string;
  expectedImpact?: string;
  risk?: string;
  budget?: number;
};

export function executiveDecisionDraft(input: DecisionInput) {
  return {
    id: `decision-${Date.now()}`,
    title: String(input.title ?? "Executive Decision"),
    recommendation: String(input.recommendation ?? ""),
    expectedImpact: String(input.expectedImpact ?? ""),
    risk: String(input.risk ?? ""),
    budget: Number(input.budget ?? 0),
    status: "PENDING_APPROVAL",
    approvalRequired: true,
    liveMutation: false,
    audit: {
      createdAt: new Date().toISOString(),
      source: "BUSINESS_AI",
    },
  };
}
