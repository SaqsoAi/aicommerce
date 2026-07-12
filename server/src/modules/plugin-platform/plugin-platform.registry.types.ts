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

export interface PluginRegistryResolution {
  tenantId?: string;
  generatedAt: string;
  snapshotVersion: string;
  entries: PluginRegistryEntry[];
  excluded: Array<{
    pluginKey: string;
    reason: string;
  }>;
}
