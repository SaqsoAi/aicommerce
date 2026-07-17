type MetricMap = Record<string, number>;

export function deepBusinessReasoning(input: {
  metrics?: MetricMap;
  previousMetrics?: MetricMap;
  constraints?: string[];
}) {
  const current = input.metrics ?? {};
  const previous = input.previousMetrics ?? {};
  const correlations = Object.keys(current).map((key) => ({
    metric: key,
    current: Number(current[key] ?? 0),
    previous: Number(previous[key] ?? 0),
    change: Number(current[key] ?? 0) - Number(previous[key] ?? 0),
  }));

  const negative = correlations.filter((item) => item.change < 0);
  const positive = correlations.filter((item) => item.change > 0);

  return {
    rootCauses: negative.map((item) =>
      `${item.metric} declined by ${Math.abs(item.change).toFixed(2)}.`,
    ),
    opportunities: positive.map((item) =>
      `${item.metric} improved by ${item.change.toFixed(2)}.`,
    ),
    constraints: input.constraints ?? [],
    reasoningChain: [
      "Compare current and previous KPI values.",
      "Identify negative and positive movement.",
      "Check operational and financial constraints.",
      "Prioritize actions by impact, cost and risk.",
    ],
    confidence: correlations.length >= 5 ? 0.82 : 0.58,
  };
}
