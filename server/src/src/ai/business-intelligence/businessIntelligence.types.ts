export type AiBiHorizon = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type AiBiSignal = {
  key: string;
  value: number | string | boolean | null;
  weight?: number;
  source?: string;
};

export type AiBiMetric = {
  key: string;
  label: string;
  value: number;
  previousValue?: number;
  unit?: string;
  trend?: "up" | "down" | "flat";
};

export type AiBiInsight = {
  title: string;
  summary: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  confidence: number;
  signals: string[];
  recommendedAction?: string;
};

export type AiBiForecastInput = {
  horizon?: AiBiHorizon;
  metrics?: AiBiMetric[];
  signals?: AiBiSignal[];
  query?: string;
  limit?: number;
};

export type AiBiForecastResult = {
  horizon: AiBiHorizon;
  forecastLabel: string;
  projectedValue: number;
  confidence: number;
  drivers: string[];
  caveats: string[];
};

export type AiBiExecutiveSummary = {
  query?: string;
  headline: string;
  summary: string;
  kpis: AiBiMetric[];
  insights: AiBiInsight[];
  forecasts: AiBiForecastResult[];
  alerts: AiBiInsight[];
  gatewayStatus?: string;
  auditId?: string;
};

export type AiBiWhatIfInput = {
  scenario: "price_change" | "discount" | "promotion" | "purchase_increase" | "inventory_increase" | "demand_increase";
  deltaPercent?: number;
  baseValue?: number;
  signals?: AiBiSignal[];
};

export type AiBiWhatIfResult = {
  scenario: AiBiWhatIfInput["scenario"];
  projectedImpact: number;
  confidence: number;
  explanation: string;
  guardrails: string[];
};
