import { aiAuditEngine } from "./auditEngine";
import { aiBudgetEngine } from "./budgetEngine";
import { aiCacheLayer } from "./cacheLayer";
import { aiCostEngine } from "./costEngine";
import { aiFeatureFlagIntegration } from "./featureFlags";
import { aiModelRegistry } from "./modelRegistry";
import { aiPromptRegistry } from "./promptRegistry";
import { aiProviderRegistry } from "./providerRegistry";
import { aiSafetyEngine } from "./safetyEngine";
import { aiUsageEngine } from "./usageEngine";
import { AiGatewayRequest, AiGatewayResponse, AiModelType, AiProviderAdapter, AiProviderName, AiTokenUsage } from "./types";
import { openAiVisionAdapter } from "./openAiVisionAdapter";
import { openAiChatAdapter, openRouterChatAdapter, claudeChatAdapter, geminiChatAdapter, ollamaChatAdapter } from "./realChatAdapters";

const adapters = new Map<string, AiProviderAdapter>();

function adapterKey(provider: AiProviderName, type?: AiModelType): string {
  return type ? `${provider}:${type}` : provider;
}

function countTokens(value: unknown): number {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return Math.max(1, Math.ceil((text || "").length / 4));
}

function normalizeUsage(input: unknown, output: unknown, usage?: Partial<AiTokenUsage>): AiTokenUsage {
  const inputTokens = usage?.inputTokens ?? countTokens(input);
  const outputTokens = usage?.outputTokens ?? countTokens(output);
  return {
    inputTokens,
    outputTokens,
    totalTokens: usage?.totalTokens ?? inputTokens + outputTokens,
    requests: usage?.requests ?? 1,
  };
}

const dryRunAdapter: AiProviderAdapter = {
  name: "local",
  async invoke(request) {
    return {
      output: {
        ok: true,
        dryRun: true,
        provider: request.model.provider,
        model: request.model.id,
        message: "AI Gateway core pipeline executed. No feature implementation/provider call was performed.",
      },
      usage: { inputTokens: countTokens(request.renderedPrompt), outputTokens: 20, requests: 1 },
    };
  },
};

export const aiGateway = {
  registerAdapter(adapter: AiProviderAdapter, modelType?: AiModelType): void {
    adapters.set(adapterKey(adapter.name, modelType), adapter);
  },

  async execute<TOutput = unknown, TInput = unknown>(request: AiGatewayRequest<TInput>): Promise<AiGatewayResponse<TOutput>> {
    const started = Date.now();
    const safety = aiSafetyEngine.inspect(request);
    const modelType = request.modelType || "chat";
    const provider = aiProviderRegistry.resolve(request.provider, modelType);
    const model = aiModelRegistry.resolve(provider.name, modelType, request.model);
    const prompt = request.promptKey ? aiPromptRegistry.approved(request.promptKey, request.promptVersion) : aiPromptRegistry.approved("ai.core.default", 1);
    const renderedPrompt = aiPromptRegistry.render(prompt.template, {
      input: typeof request.input === "string" ? request.input : JSON.stringify(request.input),
      ...(request.variables || {}),
    });

    if (!aiFeatureFlagIntegration.isEnabled(request.feature, request.actor?.tenantId)) {
      const latencyMs = Date.now() - started;
      const usage = normalizeUsage(renderedPrompt, "", { inputTokens: countTokens(renderedPrompt), outputTokens: 0, requests: 1 });
      const audit = aiAuditEngine.record({
        userId: request.actor?.userId,
        tenantId: request.actor?.tenantId,
        provider: provider.name,
        model: model.id,
        promptKey: prompt.key,
        promptVersion: prompt.version,
        feature: request.feature,
        tokens: usage,
        latencyMs,
        estimatedCostUsd: 0,
        status: "blocked",
        prompt: aiSafetyEngine.redact(renderedPrompt),
        blockedReason: "Feature flag disabled",
        metadata: request.metadata,
      });
      return { status: "blocked", feature: request.feature, provider: provider.name, model: model.id, promptKey: prompt.key, promptVersion: prompt.version, blockedReason: "Feature flag disabled", latencyMs, usage, estimatedCostUsd: 0, auditId: audit.id };
    }

    if (!safety.allowed) {
      const latencyMs = Date.now() - started;
      const usage = normalizeUsage(renderedPrompt, "", { inputTokens: countTokens(renderedPrompt), outputTokens: 0, requests: 1 });
      const audit = aiAuditEngine.record({
        userId: request.actor?.userId,
        tenantId: request.actor?.tenantId,
        provider: provider.name,
        model: model.id,
        promptKey: prompt.key,
        promptVersion: prompt.version,
        feature: request.feature,
        tokens: usage,
        latencyMs,
        estimatedCostUsd: 0,
        status: "blocked",
        prompt: aiSafetyEngine.redact(renderedPrompt),
        blockedReason: safety.reason,
        metadata: { ...(request.metadata || {}), safetyFlags: safety.flags },
      });
      return { status: "blocked", feature: request.feature, provider: provider.name, model: model.id, promptKey: prompt.key, promptVersion: prompt.version, blockedReason: safety.reason, latencyMs, usage, estimatedCostUsd: 0, auditId: audit.id };
    }

    aiBudgetEngine.assertAllowed({ tenantId: request.actor?.tenantId, feature: request.feature, provider: provider.name });

    const cached = await aiCacheLayer.get<TOutput>(request.cacheKey);
    if (cached !== undefined) {
      const latencyMs = Date.now() - started;
      const usage = normalizeUsage(renderedPrompt, cached, { inputTokens: 0, outputTokens: 0, totalTokens: 0, requests: 1 });
      const audit = aiAuditEngine.record({
        userId: request.actor?.userId,
        tenantId: request.actor?.tenantId,
        provider: provider.name,
        model: model.id,
        promptKey: prompt.key,
        promptVersion: prompt.version,
        feature: request.feature,
        tokens: usage,
        latencyMs,
        estimatedCostUsd: 0,
        status: "cached",
        prompt: aiSafetyEngine.redact(renderedPrompt),
        responsePreview: aiSafetyEngine.redact(cached),
        metadata: request.metadata,
      });
      aiUsageEngine.record({ userId: request.actor?.userId, tenantId: request.actor?.tenantId, provider: provider.name, model: model.id, promptKey: prompt.key, promptVersion: prompt.version, feature: request.feature, tokens: usage, latencyMs, estimatedCostUsd: 0, status: "cached" });
      return { status: "cached", feature: request.feature, provider: provider.name, model: model.id, promptKey: prompt.key, promptVersion: prompt.version, output: cached, latencyMs, usage, estimatedCostUsd: 0, auditId: audit.id, cached: true };
    }

    const adapter = adapters.get(adapterKey(provider.name, modelType)) || adapters.get(adapterKey(provider.name)) || dryRunAdapter;
    const result = await adapter.invoke({ model, prompt, renderedPrompt, input: request.input, variables: request.variables, metadata: request.metadata });
    const usage = normalizeUsage(renderedPrompt, result.output, result.usage);
    const estimatedCostUsd = aiCostEngine.estimate(provider, usage);
    const latencyMs = Date.now() - started;

    await aiCacheLayer.set(request.cacheKey, result.output as TOutput);

    const audit = aiAuditEngine.record({
      userId: request.actor?.userId,
      tenantId: request.actor?.tenantId,
      provider: provider.name,
      model: model.id,
      promptKey: prompt.key,
      promptVersion: prompt.version,
      feature: request.feature,
      tokens: usage,
      latencyMs,
      estimatedCostUsd,
      status: "completed",
      prompt: aiSafetyEngine.redact(renderedPrompt),
      responsePreview: aiSafetyEngine.redact(result.output),
      metadata: request.metadata,
    });

    aiUsageEngine.record({ userId: request.actor?.userId, tenantId: request.actor?.tenantId, provider: provider.name, model: model.id, promptKey: prompt.key, promptVersion: prompt.version, feature: request.feature, tokens: usage, latencyMs, estimatedCostUsd, status: "completed" });

    return { status: "completed", feature: request.feature, provider: provider.name, model: model.id, promptKey: prompt.key, promptVersion: prompt.version, output: result.output as TOutput, latencyMs, usage, estimatedCostUsd, auditId: audit.id };
  },
};

aiGateway.registerAdapter(dryRunAdapter);
aiGateway.registerAdapter(openAiVisionAdapter, "vision");
if (process.env.OPENAI_API_KEY) aiGateway.registerAdapter(openAiChatAdapter, "chat");
if (process.env.OPENROUTER_API_KEY) aiGateway.registerAdapter(openRouterChatAdapter, "chat");
if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) aiGateway.registerAdapter(claudeChatAdapter, "chat");
if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) aiGateway.registerAdapter(geminiChatAdapter, "chat");
if (process.env.OLLAMA_BASE_URL) aiGateway.registerAdapter(ollamaChatAdapter, "chat");


