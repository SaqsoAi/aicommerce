export const aiFeatureFlagIntegration = {
  isEnabled(feature: string, tenantId?: string): boolean {
    const normalized = feature.replace(/[^A-Z0-9]/gi, "_").toUpperCase();
    const tenantKey = tenantId ? `AI_FEATURE_${tenantId.replace(/[^A-Z0-9]/gi, "_").toUpperCase()}_${normalized}` : "";
    if (tenantKey && process.env[tenantKey] !== undefined) return process.env[tenantKey] === "true";
    const key = `AI_FEATURE_${normalized}`;
    if (process.env[key] !== undefined) return process.env[key] === "true";
    if (process.env.AI_FEATURES_ENABLED !== undefined) return process.env.AI_FEATURES_ENABLED === "true";
    return true;
  },
};