export type AiProviderName =
  | "openai"
  | "gemini"
  | "claude"
  | "openrouter"
  | "fal"
  | "replicate"
  | "stability"
  | "ollama"
  | "local";

export type AiModelType =
  | "chat"
  | "vision"
  | "image"
  | "video"
  | "embedding"
  | "ocr"
  | "speech";

export type AiRequestStatus = "allowed" | "blocked" | "failed" | "completed" | "cached";

export interface AiActor {
  userId?: string;
  tenantId?: string;
  role?: string;
  ip?: string;
  userAgent?: string;
}

export interface AiGatewayRequest<TInput = unknown> {
  feature: string;
  provider?: AiProviderName;
  model?: string;
  modelType?: AiModelType;
  promptKey?: string;
  promptVersion?: number;
  category?: string;
  input: TInput;
  promptInput?: unknown;
  variables?: Record<string, string | number | boolean | null | undefined>;
  actor?: AiActor;
  cacheKey?: string;
  metadata?: Record<string, unknown>;
}

export interface AiGatewayResponse<TOutput = unknown> {
  status: AiRequestStatus;
  feature: string;
  provider: AiProviderName;
  model: string;
  promptKey?: string;
  promptVersion?: number;
  output?: TOutput;
  blockedReason?: string;
  latencyMs: number;
  usage: AiTokenUsage;
  estimatedCostUsd: number;
  auditId: string;
  cached?: boolean;
}

export interface AiTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  requests: number;
}

export interface AiProviderConfig {
  name: AiProviderName;
  enabled: boolean;
  displayName: string;
  apiKeyEnv?: string;
  baseUrlEnv?: string;
  priority: number;
  supports: AiModelType[];
  defaultModels: Partial<Record<AiModelType, string>>;
  costPer1kInputUsd?: number;
  costPer1kOutputUsd?: number;
}

export interface AiModelConfig {
  id: string;
  provider: AiProviderName;
  type: AiModelType;
  enabled: boolean;
  displayName: string;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  temperature?: number;
  metadata?: Record<string, unknown>;
}

export interface AiPromptTemplate {
  key: string;
  version: number;
  category: string;
  title: string;
  approved: boolean;
  template: string;
  variables: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  rollbackFromVersion?: number;
}

export interface AiSafetyResult {
  allowed: boolean;
  reason?: string;
  flags: string[];
}

export interface AiBudgetPolicy {
  scope: "global" | "tenant" | "feature" | "provider";
  scopeId: string;
  dailyUsd?: number;
  monthlyUsd?: number;
  dailyRequests?: number;
  monthlyRequests?: number;
  enabled: boolean;
}

export interface AiUsageRecord {
  id: string;
  at: string;
  userId?: string;
  tenantId?: string;
  provider: AiProviderName;
  model: string;
  promptKey?: string;
  promptVersion?: number;
  feature: string;
  tokens: AiTokenUsage;
  latencyMs: number;
  estimatedCostUsd: number;
  status: AiRequestStatus;
}

export interface AiAuditRecord extends AiUsageRecord {
  prompt?: string;
  responsePreview?: string;
  blockedReason?: string;
  metadata?: Record<string, unknown>;
}

export interface AiProviderAdapter {
  name: AiProviderName;
  invoke(request: {
    model: AiModelConfig;
    prompt?: AiPromptTemplate;
    renderedPrompt: string;
    input: unknown;
    variables?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<{
    output: unknown;
    usage?: Partial<AiTokenUsage>;
    raw?: unknown;
  }>;
}

