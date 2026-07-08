import { aiGateway } from "../core/gateway";
import type {
  AiBiExecutiveSummary,
  AiBiForecastInput,
  AiBiForecastResult,
  AiBiHorizon,
  AiBiInsight,
  AiBiMetric,
  AiBiWhatIfInput,
  AiBiWhatIfResult,
} from "./businessIntelligence.types";

type GatewayResult = Awaited<ReturnType<typeof aiGateway.execute>>;

const DEFAULT_HORIZON: AiBiHorizon = "monthly";

function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function trendOf(value: number, previousValue?: number): "up" | "down" | "flat" {
  if (typeof previousValue !== "number") return "flat";
  if (value > previousValue) return "up";
  if (value < previousValue) return "down";
  return "flat";
}

function normalizeMetric(metric: AiBiMetric): AiBiMetric {
  return {
    ...metric,
    value: safeNumber(metric.value),
    previousValue: typeof metric.previousValue === "number" ? metric.previousValue : undefined,
    trend: metric.trend || trendOf(safeNumber(metric.value), metric.previousValue),
  };
}

function localForecast(input: AiBiForecastInput): AiBiForecastResult[] {
  const horizon = input.horizon || DEFAULT_HORIZON;
  const metrics = (input.metrics || []).map(normalizeMetric);
  const limit = Math.max(1, Math.min(input.limit || 8, 20));

  if (metrics.length === 0) {
    return [{
      horizon,
      forecastLabel: "No historical metric supplied",
      projectedValue: 0,
      confidence: 0.35,
      drivers: ["Fallback projection only"],
      caveats: ["Connect order, inventory, purchase, and report aggregates for stronger forecast quality."],
    }];
  }

  return metrics.slice(0, limit).map((metric) => {
    const previous = typeof metric.previousValue === "number" ? metric.previousValue : metric.value;
    const delta = metric.value - previous;
    const projected = Math.max(0, metric.value + delta * 0.6);
    return {
      horizon,
      forecastLabel: metric.label,
      projectedValue: Number(projected.toFixed(2)),
      confidence: Number((metric.trend === "flat" ? 0.58 : 0.66).toFixed(2)),
      drivers: [
        `Current ${metric.label}: ${metric.value}${metric.unit ? " " + metric.unit : ""}`,
        `Trend: ${metric.trend || trendOf(metric.value, metric.previousValue)}`,
      ],
      caveats: ["AI BI projections do not overwrite actual commerce data.", "Use with approved analytics source of truth."],
    };
  });
}

function generateInsights(metrics: AiBiMetric[]): AiBiInsight[] {
  const normalized = metrics.map(normalizeMetric);
  const insights: AiBiInsight[] = [];

  for (const metric of normalized) {
    if (metric.trend === "down") {
      insights.push({
        title: `${metric.label} declined`,
        summary: `${metric.label} is below its previous value. Review sales, inventory, returns, discounts, and channel changes.`,
        severity: "medium",
        confidence: 0.64,
        signals: [metric.key],
        recommendedAction: "Open executive dashboard and compare category, brand, and product level movements.",
      });
    }

    if (metric.trend === "up") {
      insights.push({
        title: `${metric.label} improved`,
        summary: `${metric.label} is trending upward. Validate whether this is demand growth, promotion impact, or stock recovery.`,
        severity: "info",
        confidence: 0.62,
        signals: [metric.key],
        recommendedAction: "Check margin, stock coverage, and supplier readiness before scaling promotion.",
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      title: "BI baseline ready",
      summary: "No critical trend detected from supplied metrics. Connect more historical commerce signals for richer executive insights.",
      severity: "info",
      confidence: 0.52,
      signals: normalized.map((item) => item.key).slice(0, 5),
    });
  }

  return insights.slice(0, 12);
}

async function throughGateway(feature: string, input: Record<string, unknown>): Promise<GatewayResult> {
  return aiGateway.execute({
    feature,
    input: {
      ...input,
      providerDetailsHiddenFromClient: true,
      phase: "6.7",
      noLiveMutation: true,
      noAutoPurchaseOrder: true,
    },
    cacheKey: `ai-bi:${feature}:${JSON.stringify(input).slice(0, 500)}`,
    metadata: {
      phase: "6.7",
      gatewayOnly: true,
      analyticsPreserved: true,
      noLiveDataOverwrite: true,
    },
  });
}

export const aiBusinessIntelligenceService = {
  async forecast(input: AiBiForecastInput): Promise<{ gatewayStatus: string; auditId?: string; results: AiBiForecastResult[] }> {
    const gateway = await throughGateway("business_intelligence_forecast", { input });
    return {
      gatewayStatus: gateway.status,
      auditId: gateway.auditId,
      results: localForecast(input),
    };
  },

  async executiveSummary(input: AiBiForecastInput): Promise<AiBiExecutiveSummary> {
    const gateway = await throughGateway("business_intelligence_executive_summary", { input });
    const kpis = (input.metrics || []).map(normalizeMetric);
    const forecasts = localForecast(input);
    const insights = generateInsights(kpis);
    const alerts = insights.filter((item) => ["high", "critical", "medium"].includes(item.severity));

    return {
      query: input.query,
      headline: "AI Executive BI Summary",
      summary: "This summary uses AI Gateway orchestration with local BI safeguards. It does not mutate orders, inventory, purchase, or financial records.",
      kpis,
      insights,
      forecasts,
      alerts,
      gatewayStatus: gateway.status,
      auditId: gateway.auditId,
    };
  },

  async whatIf(input: AiBiWhatIfInput): Promise<{ gatewayStatus: string; auditId?: string; result: AiBiWhatIfResult }> {
    const gateway = await throughGateway("business_intelligence_what_if", { input });
    const baseValue = safeNumber(input.baseValue, 100);
    const delta = safeNumber(input.deltaPercent, 0);
    const impact = baseValue * (delta / 100);

    return {
      gatewayStatus: gateway.status,
      auditId: gateway.auditId,
      result: {
        scenario: input.scenario,
        projectedImpact: Number(impact.toFixed(2)),
        confidence: 0.56,
        explanation: `Scenario projection only. A ${delta}% change against base value ${baseValue} estimates impact ${impact.toFixed(2)}.`,
        guardrails: [
          "Projection only; never modify live data automatically.",
          "Never auto-create purchase orders.",
          "Require admin approval for business decisions.",
        ],
      },
    };
  },
};
