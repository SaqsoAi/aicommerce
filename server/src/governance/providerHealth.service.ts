import { providerRegistryService, type ProviderDefinition } from "./providerRegistry.service";

export type ProviderHealth = {
  type: string;
  provider: string;
  enabled: boolean;
  healthy: boolean;
  missingEnv: string[];
  checkedAt: string;
};

function checkProvider(item: ProviderDefinition): ProviderHealth {
  const missingEnv = item.requiredEnv.filter((key) => !process.env[key]);
  return {
    type: item.type,
    provider: item.activeProvider,
    enabled: item.status === "ENABLED",
    healthy: item.status === "ENABLED" && missingEnv.length === 0,
    missingEnv,
    checkedAt: new Date().toISOString()
  };
}

export const providerHealthService = {
  checkAll(): ProviderHealth[] {
    return providerRegistryService.list().map(checkProvider);
  },

  check(type: any): ProviderHealth {
    return checkProvider(providerRegistryService.resolve(type));
  }
};
