export interface TenantPluginContext {
  actorId: string;
  tenantId: string;
  role: string;
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
