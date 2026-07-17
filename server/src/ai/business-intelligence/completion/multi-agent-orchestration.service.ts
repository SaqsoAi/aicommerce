type AgentName =
  | "COORDINATOR"
  | "CEO"
  | "CFO"
  | "COO"
  | "CMO"
  | "INVENTORY"
  | "PROCUREMENT"
  | "CUSTOMER";

const AGENTS: Record<AgentName, string> = {
  COORDINATOR: "Combines evidence and resolves conflicts between specialists.",
  CEO: "Evaluates growth, strategic risk and priorities.",
  CFO: "Evaluates margin, budget, cash and financial risk.",
  COO: "Evaluates fulfillment, inventory and operational capacity.",
  CMO: "Evaluates customer acquisition, retention and campaign strategy.",
  INVENTORY: "Evaluates stock cover, dead stock and reorder requirements.",
  PROCUREMENT: "Evaluates suppliers, purchase planning and lead time.",
  CUSTOMER: "Evaluates segments, retention, churn and lifetime value.",
};

export function orchestrateBusinessAgents(input: {
  question?: string;
  evidence?: unknown;
  agents?: AgentName[];
}) {
  const selected = input.agents?.length
    ? input.agents
    : (Object.keys(AGENTS) as AgentName[]);

  const responses = selected.map((agent) => ({
    agent,
    mandate: AGENTS[agent],
    evidence: input.evidence ?? {},
    recommendationStatus: "READY_FOR_REASONING",
  }));

  return {
    question: String(input.question ?? ""),
    coordinator: "COORDINATOR",
    responses,
    arbitration: {
      rule: "Evidence first; financial and operational blockers override optimistic growth assumptions.",
      approvalRequired: true,
    },
  };
}
