export type ModuleScope="PLATFORM"|"TENANT"|"SHARED";
export const moduleRegistry=[
 {key:"platform",scope:"PLATFORM",owner:"server/src/modules/platform-tenancy"},
 {key:"plugin-platform",scope:"PLATFORM",owner:"server/src/modules/plugin-platform"},
 {key:"commerce",scope:"TENANT",owner:"server/src/modules/product-engine"},
 {key:"inventory",scope:"TENANT",owner:"server/src/modules/inventory-dashboard"},
 {key:"business-ai",scope:"TENANT",owner:"server/src/ai/business-intelligence"},
 {key:"ai-builder",scope:"PLATFORM",owner:"server/src/ai/developmentCopilot"}
] as const;
