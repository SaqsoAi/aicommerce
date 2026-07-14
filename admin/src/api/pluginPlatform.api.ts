import api from "@/api/client";

export type PluginStatus =
  | "DISCOVERED"
  | "VALIDATED"
  | "PLANNED"
  | "INSTALLING"
  | "INSTALLED"
  | "ACTIVE"
  | "INACTIVE"
  | "FAILED"
  | "ROLLBACK_REQUIRED"
  | "UNINSTALLED"
  | string;

export interface PluginVersionSummary {
  id: string;
  version: string;
  packageSha256?: string | null;
  manifest?: Record<string, unknown>;
  createdAt?: string;
}

export interface PluginHealthSummary {
  id?: string;
  checkKey?: string;
  key?: string;
  type?: string;
  target?: string | null;
  required?: boolean;
  lastStatus?: string | null;
  status?: string;
  lastMessage?: string | null;
  message?: string | null;
  checkedAt?: string | null;
}

export interface PluginInstallationSummary {
  id: string;
  status: string;
  planFingerprint?: string | null;
  createdAt?: string;
  completedAt?: string | null;
  pluginVersionId?: string;
}

export interface PluginAuditEvent {
  id: string;
  action: string;
  outcome: string;
  reason?: string | null;
  actorId?: string | null;
  metadata?: unknown;
  createdAt?: string;
}

export interface PluginSettingDefinition {
  id: string;
  settingKey: string;
  label?: string;
  type?: string;
  scope: "GLOBAL" | "TENANT" | string;
  required?: boolean;
  defaultValue?: unknown;
  schema?: Record<string, unknown>;
}

export interface PluginSettingValue {
  id: string;
  settingKey: string;
  scope: string;
  tenantId?: string | null;
  value: unknown;
  updatedAt?: string;
}

export interface PluginTenantAccess {
  id: string;
  tenantId: string;
  enabled: boolean;
  configuration?: unknown;
  updatedAt?: string;
}

export interface PluginDependencyDetail {
  id?: string;
  optional?: boolean;
  mustBeActive?: boolean;
  dependency?: {
    pluginKey: string;
    name?: string;
    status?: string;
    currentVersion?: string | null;
  };
}

export interface PluginSummary {
  id: string;
  pluginKey: string;
  name: string;
  description?: string | null;
  vendorKey?: string | null;
  tenantScope?: string | null;
  currentVersion?: string | null;
  status: PluginStatus;
  manifest?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  versions?: PluginVersionSummary[];
  installations?: PluginInstallationSummary[];
  dependencies?: PluginDependencyDetail[];
  permissions?: Array<Record<string, unknown>>;
  settings?: PluginSettingDefinition[];
  settingValues?: PluginSettingValue[];
  tenantAccess?: PluginTenantAccess[];
  healthChecks?: PluginHealthSummary[];
  auditEvents?: PluginAuditEvent[];
}


export type PluginTransactionStatus =
  | "PREPARING"
  | "VALIDATING"
  | "BACKING_UP"
  | "APPLYING_FILES"
  | "MIGRATION_REVIEW_REQUIRED"
  | "VERIFYING"
  | "COMMITTING"
  | "SUCCEEDED"
  | "FAILED"
  | "ROLLING_BACK"
  | "ROLLED_BACK"
  | string;

export interface PluginFileOperationSummary {
  id: string;
  sequence: number;
  owner: string;
  destinationPath: string;
  operation: string;
  previousSha256?: string | null;
  expectedSha256: string;
  appliedSha256?: string | null;
  status: string;
  errorMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PluginTransactionLogSummary {
  id: string;
  level: string;
  event: string;
  message: string;
  metadata?: unknown;
  createdAt?: string;
}

export interface PluginTransactionSummary {
  id: string;
  status: PluginTransactionStatus;
  planFingerprint: string;
  packageSha256: string;
  stagingPath?: string;
  backupPath?: string | null;
  journal?: unknown;
  migrationGate?: {
    declared?: boolean;
    migrationPlanPath?: string | null;
    rollbackPlanPath?: string | null;
    deployExecuted?: boolean;
  } | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  requestedBy?: string;
  startedAt?: string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  plugin?: PluginSummary;
  installation?: PluginInstallationSummary;
  fileOperations?: PluginFileOperationSummary[];
  logs?: PluginTransactionLogSummary[];
}

export interface ValidationIssue {
  code: string;
  path?: string;
  message: string;
}

export interface ArchiveValidationResult {
  success: boolean;
  sha256?: string;
  manifest?: Record<string, unknown>;
  entries?: Array<{
    path: string;
    compressedSize: number;
    uncompressedSize: number;
  }>;
  issues?: ValidationIssue[];
}

export interface ManifestValidationResult {
  success: boolean;
  manifest?: Record<string, unknown>;
  issues?: ValidationIssue[];
}

export interface InstallationPlan {
  pluginKey: string;
  version: string;
  packageSha256: string;
  fingerprint: string;
  files: unknown[];
  dependencies: unknown[];
  conflicts: unknown[];
  databaseChanges: unknown;
  requiresRestart: boolean;
  requiresRebuild: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  code?: string;
  message?: string;
  issues?: ValidationIssue[];
}

function dataOf<T>(response: { data?: ApiEnvelope<T> | T }): T {
  const body = response.data as ApiEnvelope<T> | T;
  if (body && typeof body === "object" && "data" in body) {
    return (body as ApiEnvelope<T>).data as T;
  }
  return body as T;
}


async function getPluginPlatformWithFallback<T>(
  primaryPath: string,
  fallbackPath: string,
  config?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await api.get(primaryPath, config);
    return dataOf<T>(response);
  } catch (primaryError) {
    try {
      const response = await api.get(fallbackPath, config);
      return dataOf<T>(response);
    } catch (fallbackError) {
      const primaryMessage = primaryError instanceof Error ? primaryError.message : String(primaryError);
      const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      throw new Error(
        `Plugin transaction API unavailable. Primary: ${primaryMessage}. Fallback: ${fallbackMessage}`
      );
    }
  }
}

async function mutation<T>(
  path: string,
  body?: Record<string, unknown>,
  method: "post" | "put" = "post"
): Promise<T> {
  const response = await api[method](path, body || {}, {
    validateStatus: (status) => status < 500,
  });
  const envelope = response.data as ApiEnvelope<T>;
  if (!envelope.success) {
    throw new Error(envelope.message || envelope.code || "Plugin lifecycle request failed");
  }
  return envelope.data as T;
}

export async function listPlugins(): Promise<PluginSummary[]> {
  const response = await api.get("/plugin-platform");
  return dataOf<PluginSummary[]>(response);
}

export async function getPlugin(pluginKey: string): Promise<PluginSummary> {
  const response = await api.get(`/plugin-platform/${encodeURIComponent(pluginKey)}`);
  return dataOf<PluginSummary>(response);
}

export async function getPluginHistory(pluginKey: string): Promise<PluginSummary> {
  const response = await api.get(
    `/plugin-platform/${encodeURIComponent(pluginKey)}/history`
  );
  return dataOf<PluginSummary>(response);
}

export async function activatePlugin(pluginKey: string, reason: string): Promise<PluginSummary> {
  return mutation(`/plugin-platform/${encodeURIComponent(pluginKey)}/activate`, { reason });
}

export async function deactivatePlugin(pluginKey: string, reason: string): Promise<PluginSummary> {
  return mutation(`/plugin-platform/${encodeURIComponent(pluginKey)}/deactivate`, { reason });
}

export async function upgradePlugin(
  pluginKey: string,
  targetVersion: string,
  reason: string
): Promise<PluginSummary> {
  return mutation(`/plugin-platform/${encodeURIComponent(pluginKey)}/upgrade`, {
    targetVersion,
    reason,
  });
}

export async function rollbackPlugin(
  pluginKey: string,
  targetVersion: string,
  reason: string
): Promise<PluginSummary> {
  return mutation(`/plugin-platform/${encodeURIComponent(pluginKey)}/rollback`, {
    targetVersion,
    reason,
  });
}

export async function uninstallPlugin(pluginKey: string, reason: string): Promise<PluginSummary> {
  return mutation(`/plugin-platform/${encodeURIComponent(pluginKey)}/uninstall`, { reason });
}

export async function runPluginHealth(
  pluginKey: string
): Promise<PluginHealthSummary[]> {
  return mutation(`/plugin-platform/${encodeURIComponent(pluginKey)}/health/run`);
}

export async function setPluginTenantAccess(input: {
  pluginKey: string;
  tenantId: string;
  enabled: boolean;
  configuration?: unknown;
  reason: string;
}): Promise<PluginTenantAccess> {
  return mutation(
    `/plugin-platform/${encodeURIComponent(input.pluginKey)}/tenants/${encodeURIComponent(
      input.tenantId
    )}`,
    {
      enabled: input.enabled,
      configuration: input.configuration,
      reason: input.reason,
    },
    "put"
  );
}

export async function setPluginSetting(input: {
  pluginKey: string;
  settingKey: string;
  scope: string;
  tenantId?: string;
  value: unknown;
  reason: string;
}): Promise<PluginSettingValue> {
  return mutation(
    `/plugin-platform/${encodeURIComponent(input.pluginKey)}/settings/${encodeURIComponent(
      input.settingKey
    )}`,
    {
      scope: input.scope,
      tenantId: input.tenantId,
      value: input.value,
      reason: input.reason,
    },
    "put"
  );
}

export async function validatePluginManifest(
  manifest: Record<string, unknown>
): Promise<ManifestValidationResult> {
  const response = await api.post("/plugin-platform/validate-manifest", manifest, {
    validateStatus: (status) => status < 500,
  });
  return response.data as ManifestValidationResult;
}

export async function validatePluginArchive(
  archiveBase64: string
): Promise<ArchiveValidationResult> {
  const response = await api.post(
    "/plugin-platform/validate-archive",
    { archiveBase64 },
    {
      validateStatus: (status) => status < 500,
      maxBodyLength: 140 * 1024 * 1024,
    }
  );
  return response.data as ArchiveValidationResult;
}

export async function createInstallationPlan(input: {
  manifest: Record<string, unknown>;
  packageSha256: string;
}): Promise<{ success: boolean; plan?: InstallationPlan; issues?: ValidationIssue[] }> {
  const response = await api.post("/plugin-platform/plans", input, {
    validateStatus: (status) => status < 500,
  });
  return response.data;
}


export async function approveInstallationPlan(
  fingerprint: string,
  reason: string
): Promise<PluginInstallationSummary> {
  return mutation(
    `/plugin-platform/installations/${encodeURIComponent(fingerprint)}/approve`,
    { reason }
  );
}

export async function executePluginTransaction(input: {
  planFingerprint: string;
  archiveBase64: string;
  reason: string;
}): Promise<PluginTransactionSummary> {
  return mutation("/plugin-platform/transactions/execute", input);
}

export async function listPluginTransactions(
  pluginKey?: string
): Promise<PluginTransactionSummary[]> {
  const config = { params: pluginKey ? { pluginKey } : undefined };
  return getPluginPlatformWithFallback<PluginTransactionSummary[]>(
    "/plugin-platform/transactions",
    "/super-admin/plugins/transactions",
    config
  );
}

export async function getPluginTransaction(
  transactionId: string
): Promise<PluginTransactionSummary> {
  const encoded = encodeURIComponent(transactionId);
  return getPluginPlatformWithFallback<PluginTransactionSummary>(
    `/plugin-platform/transactions/${encoded}`,
    `/super-admin/plugins/transactions/${encoded}`,
    {
      params: { refresh: Date.now().toString() },
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    },
  );
}

export async function acknowledgePluginMigrationReview(
  transactionId: string,
  reason: string
): Promise<PluginTransactionSummary> {
  return mutation(
    `/plugin-platform/transactions/${encodeURIComponent(transactionId)}/migration-review`,
    { reason }
  );
}

export async function continuePluginTransaction(
  transactionId: string,
  reason: string,
): Promise<PluginTransactionSummary> {
  return mutation(
    `/plugin-platform/transactions/${encodeURIComponent(transactionId)}/continue`,
    { reason },
  );
}

export async function recoverPluginTransaction(
  transactionId: string,
  reason: string,
): Promise<PluginTransactionSummary> {
  return mutation(
    `/plugin-platform/transactions/${encodeURIComponent(transactionId)}/recover`,
    { reason },
  );
}

export async function cancelPluginTransaction(
  transactionId: string,
  reason: string,
): Promise<PluginTransactionSummary> {
  return mutation(
    `/plugin-platform/transactions/${encodeURIComponent(transactionId)}/cancel`,
    { reason },
  );
}


export interface PluginAccessReason {
  code: string;
  allowed: boolean;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface PluginEffectiveAccess {
  pluginKey: string;
  tenantId: string;
  allowed: boolean;
  evaluatedAt: string;
  cacheTtlSeconds: number;
  pluginStatus: string;
  assignmentEnabled: boolean;
  subscriptionSatisfied: boolean;
  featureFlagsSatisfied: boolean;
  dependenciesSatisfied: boolean;
  configurationSatisfied: boolean;
  reasons: PluginAccessReason[];
}

export async function evaluatePluginAccess(
  pluginKey: string,
  tenantId: string,
  refresh = false
): Promise<PluginEffectiveAccess> {
  const response = await api.get("/plugin-platform/access/evaluate", {
    params: { pluginKey, tenantId, refresh: String(refresh) },
  });
  return dataOf<PluginEffectiveAccess>(response);
}

export async function getTenantPluginAccessMatrix(
  tenantId: string
): Promise<PluginEffectiveAccess[]> {
  const response = await api.get(
    `/plugin-platform/access/matrix/${encodeURIComponent(tenantId)}`
  );
  return dataOf<PluginEffectiveAccess[]>(response);
}

export async function invalidatePluginAccessCache(input?: {
  pluginKey?: string;
  tenantId?: string;
}): Promise<{ invalidated: number }> {
  return mutation("/plugin-platform/access/invalidate", input || {});
}


export type PluginRegistryType =
  | "MENU"
  | "PERMISSION"
  | "WIDGET"
  | "SETTING"
  | "EVENT"
  | "CAPABILITY";

export interface PluginRegistryIssue {
  code: string;
  severity: "ERROR" | "WARNING";
  pluginKey?: string;
  registryType?: PluginRegistryType;
  registrationKey?: string;
  message: string;
}

export interface PluginRegistryEntry {
  registryType: PluginRegistryType;
  key: string;
  pluginKey: string;
  priority: number;
  enabled: boolean;
  adapterKey?: string;
  routeKey?: string;
  permission?: string;
  roles?: string[];
  payload: Record<string, unknown>;
}

export interface PluginRegistrySnapshot {
  version: string;
  generatedAt: string;
  expiresAt: string;
  healthy: boolean;
  plugins: string[];
  counts: Record<PluginRegistryType, number>;
  entries: PluginRegistryEntry[];
  issues: PluginRegistryIssue[];
}

export interface PluginRegistryHealth {
  healthy: boolean;
  version: string;
  generatedAt: string;
  plugins: number;
  entries: number;
  enabledEntries: number;
  errors: number;
  warnings: number;
  counts: Record<PluginRegistryType, number>;
  issues: PluginRegistryIssue[];
}

export interface PluginRegistryResolution {
  tenantId?: string;
  generatedAt: string;
  snapshotVersion: string;
  entries: PluginRegistryEntry[];
  excluded: Array<{ pluginKey: string; reason: string }>;
}

export async function getPluginRegistrySnapshot(
  refresh = false
): Promise<PluginRegistrySnapshot> {
  const response = await api.get("/plugin-platform/registry/snapshot", {
    params: { refresh: String(refresh) },
  });
  return dataOf<PluginRegistrySnapshot>(response);
}

export async function getPluginRegistryHealth(
  refresh = false
): Promise<PluginRegistryHealth> {
  const response = await api.get("/plugin-platform/registry/health", {
    params: { refresh: String(refresh) },
  });
  return dataOf<PluginRegistryHealth>(response);
}

export async function resolvePluginRegistry(input?: {
  tenantId?: string;
  role?: string;
  registryType?: PluginRegistryType;
  refresh?: boolean;
}): Promise<PluginRegistryResolution> {
  const response = await api.get("/plugin-platform/registry/resolve", {
    params: {
      tenantId: input?.tenantId,
      role: input?.role,
      registryType: input?.registryType,
      refresh: String(Boolean(input?.refresh)),
    },
  });
  return dataOf<PluginRegistryResolution>(response);
}

export async function invalidatePluginRegistryCache(): Promise<{
  invalidated: number;
}> {
  return mutation("/plugin-platform/registry/invalidate");
}


export type PluginConfigurationFieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "BOOLEAN"
  | "SELECT"
  | "JSON"
  | "SECRET_REFERENCE";

export interface PluginConfigurationField {
  key: string;
  label: string;
  description?: string;
  type: PluginConfigurationFieldType;
  scope: "GLOBAL" | "TENANT";
  required: boolean;
  tenantAdminEditable: boolean;
  options: Array<{ label: string; value: string }>;
  validation: Record<string, unknown>;
  defaultValue?: unknown;
  globalValue?: unknown;
  tenantValue?: unknown;
  effectiveValue?: unknown;
  inheritedFrom: "TENANT" | "GLOBAL" | "DEFAULT" | "NONE";
  configured: boolean;
  secretReferenceConfigured: boolean;
}

export interface PluginConfigurationDocument {
  pluginKey: string;
  pluginName: string;
  tenantId?: string;
  generatedAt: string;
  fields: PluginConfigurationField[];
  complete: boolean;
  missingRequired: string[];
}

export interface PluginConfigurationAuditEvent {
  id: string;
  action: string;
  outcome: string;
  reason?: string | null;
  actorId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
}

export async function getPluginConfiguration(
  pluginKey: string,
  tenantId?: string
): Promise<PluginConfigurationDocument> {
  const response = await api.get(
    `/plugin-platform/configuration/${encodeURIComponent(pluginKey)}`,
    { params: tenantId ? { tenantId } : undefined }
  );
  return dataOf<PluginConfigurationDocument>(response);
}

export async function validatePluginConfigurationField(input: {
  pluginKey: string;
  settingKey: string;
  value: unknown;
}): Promise<{
  valid: boolean;
  issues: Array<{ code: string; field: string; message: string }>;
}> {
  return mutation(
    `/plugin-platform/configuration/${encodeURIComponent(input.pluginKey)}/validate`,
    { settingKey: input.settingKey, value: input.value }
  );
}

export async function savePluginConfigurationField(input: {
  pluginKey: string;
  settingKey: string;
  scope: "GLOBAL" | "TENANT";
  tenantId?: string;
  value: unknown;
  reason: string;
}): Promise<{
  id: string;
  settingKey: string;
  scope: string;
  tenantId?: string | null;
  updatedAt?: string;
  secretReference: boolean;
}> {
  return mutation(
    `/plugin-platform/configuration/${encodeURIComponent(
      input.pluginKey
    )}/${encodeURIComponent(input.settingKey)}`,
    {
      scope: input.scope,
      tenantId: input.tenantId,
      value: input.value,
      reason: input.reason,
    },
    "put"
  );
}

export async function getPluginConfigurationHistory(
  pluginKey: string,
  tenantId?: string
): Promise<PluginConfigurationAuditEvent[]> {
  const response = await api.get(
    `/plugin-platform/configuration/${encodeURIComponent(pluginKey)}/history`,
    { params: tenantId ? { tenantId } : undefined }
  );
  return dataOf<PluginConfigurationAuditEvent[]>(response);
}


export async function getTenantEditablePluginConfiguration(
  pluginKey: string
): Promise<PluginConfigurationDocument> {
  const response = await api.get(
    `/plugin-platform/tenant/configuration/${encodeURIComponent(
      pluginKey
    )}`
  );
  return dataOf<PluginConfigurationDocument>(response);
}

export async function validateTenantPluginConfigurationField(input: {
  pluginKey: string;
  settingKey: string;
  value: unknown;
}): Promise<{
  valid: boolean;
  issues: Array<{
    code: string;
    field: string;
    message: string;
  }>;
}> {
  return mutation(
    `/plugin-platform/tenant/configuration/${encodeURIComponent(
      input.pluginKey
    )}/validate`,
    {
      settingKey: input.settingKey,
      value: input.value,
    }
  );
}

export async function saveTenantPluginConfigurationField(input: {
  pluginKey: string;
  settingKey: string;
  value: unknown;
  reason: string;
}) {
  return mutation(
    `/plugin-platform/tenant/configuration/${encodeURIComponent(
      input.pluginKey
    )}/${encodeURIComponent(input.settingKey)}`,
    {
      value: input.value,
      reason: input.reason,
    },
    "put"
  );
}

export async function getTenantPluginConfigurationHistory(
  pluginKey: string
): Promise<PluginConfigurationAuditEvent[]> {
  const response = await api.get(
    `/plugin-platform/tenant/configuration/${encodeURIComponent(
      pluginKey
    )}/history`
  );
  return dataOf<PluginConfigurationAuditEvent[]>(response);
}


export interface TenantPluginVisibilityItem {
  pluginKey: string;
  name: string;
  enabled: boolean;
  status: string;
  effectiveAccess: boolean;
  menus: Array<Record<string, unknown>>;
  widgets: Array<Record<string, unknown>>;
  capabilities: Array<Record<string, unknown>>;
}

export interface TenantPluginVisibilityDocument {
  tenantId: string;
  generatedAt: string;
  plugins: TenantPluginVisibilityItem[];
}

export async function getTenantPluginVisibility(): Promise<
  TenantPluginVisibilityDocument
> {
  const response = await api.get(
    "/plugin-platform/tenant/visibility"
  );
  return dataOf<TenantPluginVisibilityDocument>(response);
}


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
  code: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  automaticEligible: boolean;
  destructive: boolean;
  message: string;
}

export interface PluginHealthOrchestrationResult {
  pluginKey: string;
  pluginName: string;
  pluginStatus: string;
  healthStatus:
    | "HEALTHY"
    | "DEGRADED"
    | "UNHEALTHY"
    | "QUARANTINE_RECOMMENDED"
    | "INACTIVE";
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

export async function getPluginPlatformHealthSnapshot(
  refresh = false
): Promise<PluginPlatformHealthSnapshot> {
  const response = await api.get(
    "/plugin-platform/health-orchestration/platform",
    { params: { refresh: String(refresh) } }
  );
  return dataOf<PluginPlatformHealthSnapshot>(response);
}

export async function runOrchestratedPluginHealth(
  pluginKey: string,
  reason: string
): Promise<PluginHealthOrchestrationResult> {
  return mutation(
    `/plugin-platform/health-orchestration/${encodeURIComponent(pluginKey)}/run`,
    { reason }
  );
}

export async function quarantinePluginByHealthPolicy(
  pluginKey: string,
  reason: string
): Promise<PluginHealthOrchestrationResult> {
  return mutation(
    `/plugin-platform/health-orchestration/${encodeURIComponent(
      pluginKey
    )}/quarantine`,
    { reason }
  );
}


export interface MarketplaceVendor {
  id: string;
  vendorKey: string;
  name: string;
  status: string;
  trustLevel: string;
  signingKeys?: Array<{
    id: string;
    keyId: string;
    algorithm: string;
    fingerprint: string;
    active: boolean;
    expiresAt?: string | null;
    revokedAt?: string | null;
  }>;
}

export interface MarketplaceRepository {
  id: string;
  repositoryKey: string;
  name: string;
  kind: string;
  status: string;
  trusted: boolean;
  allowedChannels: string[];
}

export interface MarketplaceEntry {
  id: string;
  pluginKey: string;
  name: string;
  version: string;
  channel: string;
  description?: string | null;
  packageSha256: string;
  trustDecision: string;
  publishedAt?: string | null;
  vendor: MarketplaceVendor;
  repository: MarketplaceRepository;
}

export async function getMarketplaceCatalog(channel?: string): Promise<MarketplaceEntry[]> {
  const response = await api.get("/plugin-platform/marketplace/catalog", {
    params: channel ? { channel } : undefined,
  });
  return dataOf<MarketplaceEntry[]>(response);
}

export async function getMarketplaceVendors(): Promise<MarketplaceVendor[]> {
  const response = await api.get("/plugin-platform/marketplace/vendors");
  return dataOf<MarketplaceVendor[]>(response);
}

export async function getMarketplaceRepositories(): Promise<MarketplaceRepository[]> {
  const response = await api.get("/plugin-platform/marketplace/repositories");
  return dataOf<MarketplaceRepository[]>(response);
}

export async function authorizeMarketplaceDownload(
  entryId: string,
  reason: string
): Promise<{
  entryId: string;
  packageLocation?: string | null;
  packageSha256: string;
  trustDecision: string;
  installationRequired: true;
  automaticInstallation: false;
}> {
  return mutation(
    `/plugin-platform/marketplace/entries/${encodeURIComponent(entryId)}/download`,
    { reason }
  );
}


export type PluginGuidanceState =
  | "NOT_INSTALLED"
  | "PENDING_SETUP"
  | "READY_TO_ACTIVATE"
  | "ACTIVE"
  | "INACTIVE"
  | "DEGRADED"
  | "BLOCKED";

export interface PluginGuidance {
  pluginKey: string;
  pluginName: string;
  lifecycleStatus: string;
  guidanceState: PluginGuidanceState;
  title: string;
  summary: string;
  instruction: string;
  documentationHref?: string;
  action?: {
    label: string;
    instruction: string;
    href?: string;
  };
  blockers: string[];
  updatedAt: string;
}

export async function listPluginGuidance(): Promise<PluginGuidance[]> {
  const response = await api.get("/plugin-platform/guidance");
  return dataOf<PluginGuidance[]>(response);
}

export async function getPluginGuidance(
  pluginKey: string
): Promise<PluginGuidance> {
  const response = await api.get(
    `/plugin-platform/guidance/${encodeURIComponent(pluginKey)}`
  );
  return dataOf<PluginGuidance>(response);
}
