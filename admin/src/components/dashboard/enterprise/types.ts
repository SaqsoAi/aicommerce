export type DashboardRole = "SUPER_ADMIN" | "ADMIN" | "USER_ADMIN" | "MANAGER";
export type DashboardAccent = "purple" | "orange" | "green";

export type MenuItem = {
  label: string;
  href: string;
  icon: string;
  permission?: string;
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export type MetricCard = {
  key: string;
  label: string;
  value: string | number | null;
  meta?: string;
  trend?: number[];
  status?: "good" | "warning" | "danger" | "neutral";
};

export type ListRow = {
  id?: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  status?: string;
  time?: string;
};

export type DashboardData = {
  role: DashboardRole;
  currency: string;
  primaryMetrics: MetricCard[];
  secondaryMetrics: MetricCard[];
  chartSeries: number[];
  overview: ListRow[];
  insights: ListRow[];
  products: ListRow[];
  orders: ListRow[];
  customers: ListRow[];
  lowStock: ListRow[];
  tasks: ListRow[];
  activity: ListRow[];
  system: MetricCard[];
  permissions?: string[];
  isEmpty?: boolean;
};