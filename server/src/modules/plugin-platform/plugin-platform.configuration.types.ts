export type PluginConfigurationFieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "BOOLEAN"
  | "SELECT"
  | "JSON"
  | "SECRET_REFERENCE";

export interface PluginConfigurationField {
  key: string;
  label: string;
  description?: string;
  type: PluginConfigurationFieldType;
  scope: "GLOBAL" | "TENANT";
  required: boolean;
  tenantAdminEditable: boolean;
  options: Array<{ label: string; value: string }>;
  validation: Record<string, unknown>;
  defaultValue?: unknown;
  globalValue?: unknown;
  tenantValue?: unknown;
  effectiveValue?: unknown;
  inheritedFrom: "TENANT" | "GLOBAL" | "DEFAULT" | "NONE";
  configured: boolean;
  secretReferenceConfigured: boolean;
}

export interface PluginConfigurationDocument {
  pluginKey: string;
  pluginName: string;
  tenantId?: string;
  generatedAt: string;
  fields: PluginConfigurationField[];
  complete: boolean;
  missingRequired: string[];
}

export interface PluginConfigurationValidationIssue {
  code: string;
  field: string;
  message: string;
}
