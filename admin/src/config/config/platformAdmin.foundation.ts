export const platformAdminFoundation = {
  identity: {
    internalRole: "SUPER_ADMIN",
    displayName: "Platform Admin",
    productName: "SAQSO.AI",
    dashboardTitle: "Platform Command Center",
    dashboardSubtitle: "Monitor tenants, subscriptions, AI usage, security and platform operations.",
  },
  sections: [
    "platform-overview",
    "tenant-overview",
    "subscription-billing",
    "ai-development",
    "ai-management",
    "project-management",
    "commerce-module-control",
    "security-center",
    "infrastructure",
  ],
  principles: {
    manageTenantOperationsDirectly: false,
    tenantIsolationRequired: true,
    moduleControlOnly: true,
  },
} as const;
