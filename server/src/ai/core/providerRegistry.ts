import { AiModelType, AiProviderConfig, AiProviderName } from "./types";

const providers = new Map<AiProviderName, AiProviderConfig>();

function register(config: AiProviderConfig): void {
  providers.set(config.name, Object.freeze({ ...config, supports: [...config.supports], defaultModels: { ...config.defaultModels } }));
}

export const aiProviderRegistry = {
  register,
  get(name: AiProviderName): AiProviderConfig | undefined {
    return providers.get(name);
  },
  list(): AiProviderConfig[] {
    return [...providers.values()].sort((a, b) => a.priority - b.priority);
  },
  enabled(type?: AiModelType): AiProviderConfig[] {
    return this.list().filter((provider) => provider.enabled && (!type || provider.supports.includes(type)));
  },
  resolve(preferred?: AiProviderName, type: AiModelType = "chat"): AiProviderConfig {
    if (preferred) {
      const exact = providers.get(preferred);
      if (exact?.enabled && exact.supports.includes(type)) return exact;
    }
    const fallback = this.enabled(type)[0];
    if (!fallback) throw new Error(`No enabled AI provider supports ${type}`);
    return fallback;
  },
};

register({
  name: "openai",
  displayName: "OpenAI",
  enabled: Boolean(process.env.OPENAI_API_KEY),
  apiKeyEnv: "OPENAI_API_KEY",
  priority: 10,
  supports: ["chat", "vision", "image", "embedding", "speech"],
  defaultModels: { chat: "gpt-4o-mini", vision: "gpt-4o-mini", image: "gpt-image-1", embedding: "text-embedding-3-small", speech: "gpt-4o-mini-tts" },
  costPer1kInputUsd: 0,
  costPer1kOutputUsd: 0,
});

register({
  name: "gemini",
  displayName: "Google Gemini",
  enabled: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
  apiKeyEnv: "GEMINI_API_KEY",
  priority: 20,
  supports: ["chat", "vision", "embedding"],
  defaultModels: { chat: "gemini-1.5-flash", vision: "gemini-1.5-flash", embedding: "text-embedding-004" },
});

register({
  name: "claude",
  displayName: "Claude",
  enabled: Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
  apiKeyEnv: "ANTHROPIC_API_KEY",
  priority: 30,
  supports: ["chat", "vision"],
  defaultModels: { chat: "claude-3-5-sonnet-latest", vision: "claude-3-5-sonnet-latest" },
});

register({
  name: "openrouter",
  displayName: "OpenRouter",
  enabled: Boolean(process.env.OPENROUTER_API_KEY),
  apiKeyEnv: "OPENROUTER_API_KEY",
  priority: 40,
  supports: ["chat", "vision"],
  defaultModels: { chat: "openai/gpt-4o-mini", vision: "openai/gpt-4o-mini" },
});

register({
  name: "fal",
  displayName: "Fal.ai",
  enabled: Boolean(process.env.FAL_KEY || process.env.FAL_API_KEY),
  apiKeyEnv: "FAL_KEY",
  priority: 50,
  supports: ["image", "video"],
  defaultModels: { image: "fal-ai/flux/dev", video: "fal-ai/fast-svd" },
});

register({
  name: "replicate",
  displayName: "Replicate",
  enabled: Boolean(process.env.REPLICATE_API_TOKEN),
  apiKeyEnv: "REPLICATE_API_TOKEN",
  priority: 60,
  supports: ["image", "video", "vision"],
  defaultModels: { image: "black-forest-labs/flux-schnell", video: "stability-ai/stable-video-diffusion", vision: "salesforce/blip" },
});

register({
  name: "stability",
  displayName: "Stability AI",
  enabled: Boolean(process.env.STABILITY_API_KEY),
  apiKeyEnv: "STABILITY_API_KEY",
  priority: 70,
  supports: ["image", "video"],
  defaultModels: { image: "stable-image-core", video: "stable-video" },
});

register({
  name: "ollama",
  displayName: "Ollama",
  enabled: Boolean(process.env.OLLAMA_BASE_URL),
  baseUrlEnv: "OLLAMA_BASE_URL",
  priority: 80,
  supports: ["chat", "embedding"],
  defaultModels: { chat: "llama3.1", embedding: "nomic-embed-text" },
});

register({
  name: "local",
  displayName: "Local Model",
  enabled: process.env.AI_LOCAL_ENABLED === "true",
  priority: 90,
  supports: ["chat", "vision", "image", "video", "embedding", "ocr", "speech"],
  defaultModels: { chat: "local-chat", vision: "local-vision", image: "local-image", video: "local-video", embedding: "local-embedding", ocr: "local-ocr", speech: "local-speech" },
});