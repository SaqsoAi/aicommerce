export type ApiState = "online" | "warning" | "unavailable";

export type DashboardMetric = {
  label: string;
  value: string;
  subtitle: string;
  state: ApiState;
  source: string;
  trend?: string;
};

export type HealthItem = {
  label: string;
  status: ApiState;
  detail: string;
};

export type ActivityItem = {
  title: string;
  detail: string;
  time: string;
  state: ApiState;
};

export type InsightItem = {
  title: string;
  detail: string;
  time: string;
  state: ApiState;
};

export type DashboardData = {
  metrics: DashboardMetric[];
  buildCards: DashboardMetric[];
  overview: DashboardMetric[];
  health: HealthItem[];
  activity: ActivityItem[];
  insights: InsightItem[];
  apiBase: string;
  generatedAt: string;
};