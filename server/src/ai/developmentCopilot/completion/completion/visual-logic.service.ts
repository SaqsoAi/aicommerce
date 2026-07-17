export type LogicNode = {
  id: string;
  type: "trigger" | "condition" | "action" | "approval" | "output";
  label: string;
  config?: Record<string, unknown>;
};

export type LogicEdge = {
  from: string;
  to: string;
  condition?: string;
};

export function compileVisualLogic(input: {
  nodes?: LogicNode[];
  edges?: LogicEdge[];
}) {
  const nodes = Array.isArray(input.nodes) ? input.nodes : [];
  const edges = Array.isArray(input.edges) ? input.edges : [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const errors: string[] = [];

  for (const edge of edges) {
    if (!nodeIds.has(edge.from)) errors.push(`Missing source node: ${edge.from}`);
    if (!nodeIds.has(edge.to)) errors.push(`Missing target node: ${edge.to}`);
  }

  const triggers = nodes.filter((node) => node.type === "trigger");
  const outputs = nodes.filter((node) => node.type === "output");

  if (triggers.length === 0) errors.push("At least one trigger node is required.");
  if (outputs.length === 0) errors.push("At least one output node is required.");

  return {
    valid: errors.length === 0,
    errors,
    graph: { nodes, edges },
    executionOrder: nodes.map((node, index) => ({
      step: index + 1,
      nodeId: node.id,
      label: node.label,
      mode: node.type === "approval" ? "WAIT_FOR_APPROVAL" : "DRY_RUN",
    })),
  };
}
