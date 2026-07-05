export type ProviderType =
  | "AI"
  | "PAYMENT"
  | "EMAIL"
  | "SMS"
  | "STORAGE"
  | "MEDIA"
  | "SEARCH"
  | "ANALYTICS"
  | "NOTIFICATION";

export type ProviderStatus = "ENABLED" | "DISABLED";

export type ProviderDefinition = {
  type: ProviderType;
  activeProvider: string;
  allowedProviders: string[];
  status: ProviderStatus;
  requiredEnv: string[];
};

const registry: ProviderDefinition[] = [
  { type: "AI", activeProvider: process.env.AI_PROVIDER || "openai", allowedProviders: ["openai", "fal", "mock"], status: "ENABLED", requiredEnv: ["OPENAI_API_KEY"] },
  { type: "PAYMENT", activeProvider: process.env.PAYMENT_PROVIDER || "manual", allowedProviders: ["manual", "stripe", "sslcommerz"], status: "ENABLED", requiredEnv: [] },
  { type: "EMAIL", activeProvider: process.env.EMAIL_PROVIDER || "smtp", allowedProviders: ["smtp", "sendgrid", "resend"], status: "ENABLED", requiredEnv: [] },
  { type: "SMS", activeProvider: process.env.SMS_PROVIDER || "manual", allowedProviders: ["manual", "twilio"], status: "ENABLED", requiredEnv: [] },
  { type: "STORAGE", activeProvider: process.env.STORAGE_PROVIDER || "local", allowedProviders: ["local", "s3", "supabase"], status: "ENABLED", requiredEnv: [] },
  { type: "MEDIA", activeProvider: process.env.MEDIA_PROVIDER || "local", allowedProviders: ["local", "cloudinary", "s3"], status: "ENABLED", requiredEnv: [] },
  { type: "SEARCH", activeProvider: process.env.SEARCH_PROVIDER || "database", allowedProviders: ["database", "meilisearch", "algolia"], status: "ENABLED", requiredEnv: [] },
  { type: "ANALYTICS", activeProvider: process.env.ANALYTICS_PROVIDER || "internal", allowedProviders: ["internal", "ga4", "posthog"], status: "ENABLED", requiredEnv: [] },
  { type: "NOTIFICATION", activeProvider: process.env.NOTIFICATION_PROVIDER || "internal", allowedProviders: ["internal", "firebase"], status: "ENABLED", requiredEnv: [] }
];

export const providerRegistryService = {
  list(): ProviderDefinition[] {
    return registry;
  },

  get(type: ProviderType): ProviderDefinition {
    const item = registry.find((x) => x.type === type);
    if (!item) throw new Error(`Unknown provider type: ${type}`);
    return item;
  },

  validate(type: ProviderType, provider: string): { ok: boolean; reason?: string } {
    const item = this.get(type);
    if (!item.allowedProviders.includes(provider)) {
      return { ok: false, reason: `Provider ${provider} is not allowed for ${type}` };
    }
    return { ok: true };
  },

  resolve(type: ProviderType): ProviderDefinition {
    const item = this.get(type);
    const validation = this.validate(type, item.activeProvider);
    if (!validation.ok) throw new Error(validation.reason);
    return item;
  }
};
