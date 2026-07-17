import api from "@/api/client";

export interface StorePluginVisibilityItem {
  pluginKey: string;
  name: string;
  enabled: boolean;
  status: string;
  effectiveAccess: boolean;
  menus: Array<Record<string, unknown>>;
  widgets: Array<Record<string, unknown>>;
  capabilities: Array<Record<string, unknown>>;
}

export interface StorePluginVisibilityDocument {
  tenantId: string;
  generatedAt: string;
  plugins: StorePluginVisibilityItem[];
}

export async function getStorePluginVisibility(): Promise<
  StorePluginVisibilityDocument
> {
  const response = await api.get(
    "/plugin-platform/tenant/visibility"
  );

  const body = response.data as {
    success?: boolean;
    data?: StorePluginVisibilityDocument;
    message?: string;
  };

  if (!body.success || !body.data) {
    throw new Error(
      body.message || "Plugin visibility is unavailable"
    );
  }

  return body.data;
}
