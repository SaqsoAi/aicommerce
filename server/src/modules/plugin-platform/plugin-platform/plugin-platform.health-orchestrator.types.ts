export type PluginOrchestratedHealthStatus =
  | "HEALTHY"
  | "DEGRADED"
  | "UNHEALTHY"
  | "QUARANTINE_RECOMMENDED"
  | "INACTIVE";

export interface PluginHealthSignal {
  key: string;
  category:
    | "DECLARED_CHECK"
    | "DEPENDENCY"
    | "REGISTRY"
    | "TRANSACTION"
    | "CONFIGURATION"
    | "TENANT_IMPACT";
  status: "PASS" | "WARN" | "FAIL";
  message: string;
  metadata?: Record<string, unknown>;
}

export interface PluginRecoveryRecommendation {
  code:
    | "RETRY_HEALTH"
    | "REVIEW_CONFIGURATION"
    | "REVIEW_DEPENDENCY"
    | "REVIEW_REGISTRY"
    | "REVIEW_TRANSACTION"
    | "QUARANTINE_PLUGIN"
    | "NO_ACTION";
  severity: "INFO" | "WARNING" | "CRITICAL";
  automaticEligible: boolean;
  destructive: boolean;
  message: string;
}

export interface PluginHealthOrchestrationResult {
  pluginKey: string;
  pluginName: string;
  pluginStatus: string;
  healthStatus: PluginOrchestratedHealthStatus;
  score: number;
  evaluatedAt: string;
  consecutiveFailureEstimate: number;
  affectedTenantCount: number;
  signals: PluginHealthSignal[];
  recommendations: PluginRecoveryRecommendation[];
}

export interface PluginPlatformHealthSnapshot {
  generatedAt: string;
  scheduler: {
    enabled: false;
    mode: "MANUAL_ONLY";
    reason: string;
  };
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    quarantineRecommended: number;
    affectedTenants: number;
  };
  plugins: PluginHealthOrchestrationResult[];
}
