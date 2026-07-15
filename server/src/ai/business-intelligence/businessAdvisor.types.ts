export type BusinessLanguage = "bn" | "en" | "mixed";
export type BusinessIntent =
  | "SALES_DIAGNOSIS"
  | "PRODUCT_PERFORMANCE"
  | "CUSTOMER_INTELLIGENCE"
  | "MARKETING_PLAN"
  | "SALES_GOAL_PLAN"
  | "CEO_REPORT"
  | "GENERAL_BUSINESS";

export type BusinessEvidence = {
  key: string;
  label: string;
  value: number | string;
  comparison?: number | string;
  source: string;
  period?: string;
};

export type BusinessAction = {
  id: string;
  title: string;
  description: string;
  owner: "ADMIN" | "MANAGER" | "MARKETING" | "INVENTORY" | "FINANCE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueInDays: number;
  expectedImpact?: string;
  estimatedBudget?: number;
  approvalRequired: boolean;
};

export type BusinessAdvisorAnswer = {
  intent: BusinessIntent;
  language: BusinessLanguage;
  headline: string;
  directAnswer: string;
  confidence: number;
  evidence: BusinessEvidence[];
  actions: BusinessAction[];
  risks: string[];
  assumptions: string[];
  printablePlan?: Record<string, unknown>;
};

export type BusinessChatRequest = {
  message: string;
  tenantId?: string;
  storeId?: string;
  periodDays?: number;
  targetUnits?: number;
  budget?: number;
};

export type TenantBusinessContext = {
  userId: string;
  role: string;
  tenantId?: string;
  storeId?: string;
};
