import { AiModelConfig, AiModelType, AiProviderName } from "./types";
import { aiProviderRegistry } from "./providerRegistry";

const models = new Map<string, AiModelConfig>();

function key(provider: AiProviderName, id: string): string {
  return `${provider}:${id}`;
}

function register(config: AiModelConfig): void {
  models.set(key(config.provider, config.id), Object.freeze({ ...config, metadata: { ...(config.metadata || {}) } }));
}

function seedFromProviders(): void {
  for (const provider of aiProviderRegistry.list()) {
    for (const [type, modelId] of Object.entries(provider.defaultModels)) {
      if (!modelId) continue;
      register({
        id: modelId,
        provider: provider.name,
        type: type as AiModelType,
        enabled: provider.enabled,
        displayName: `${provider.displayName} ${modelId}`,
      });
    }
  }
}

seedFromProviders();

export const aiModelRegistry = {
  register,
  list(type?: AiModelType): AiModelConfig[] {
    return [...models.values()].filter((model) => !type || model.type === type);
  },
  get(provider: AiProviderName, id: string): AiModelConfig | undefined {
    return models.get(key(provider, id));
  },
  resolve(provider: AiProviderName, type: AiModelType = "chat", preferredModel?: string): AiModelConfig {
    if (preferredModel) {
      const exact = this.get(provider, preferredModel);
      if (exact?.enabled && exact.type === type) return exact;
    }
    const providerConfig = aiProviderRegistry.get(provider);
    const defaultModelId = providerConfig?.defaultModels[type];
    if (defaultModelId) {
      const defaultModel = this.get(provider, defaultModelId);
      if (defaultModel?.enabled) return defaultModel;
    }
    const fallback = this.list(type).find((model) => model.provider === provider && model.enabled);
    if (!fallback) throw new Error(`No enabled ${type} model registered for provider ${provider}`);
    return fallback;
  },
};