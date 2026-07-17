import prisma from "../../config/prisma";

type SettingSeed = {
  group: string;
  key: string;
  label: string;
  type: string;
  description: string;
  permission: string;
};

const settingDefinitions: SettingSeed[] = [
  { group: "STORE_PROFILE", key: "store.name", label: "Store Name", type: "text", description: "Main public store name", permission: "settings.store_profile" },
  { group: "STORE_PROFILE", key: "store.domain", label: "Store URL / Domain", type: "text", description: "Store domain or local URL", permission: "settings.store_profile" },
  { group: "STORE_PROFILE", key: "store.logo", label: "Store Logo", type: "image", description: "Store logo URL", permission: "settings.store_profile" },
  { group: "STORE_PROFILE", key: "store.favicon", label: "Favicon", type: "image", description: "Favicon URL", permission: "settings.store_profile" },
  { group: "STORE_PROFILE", key: "store.description", label: "Store Description", type: "textarea", description: "Short store description", permission: "settings.store_profile" },
  { group: "STORE_PROFILE", key: "store.businessType", label: "Business Type", type: "select", description: "Fashion, electronics, grocery etc.", permission: "settings.store_profile" },
  { group: "STORE_PROFILE", key: "store.email", label: "Contact Email", type: "email", description: "Support email", permission: "settings.store_profile" },
  { group: "STORE_PROFILE", key: "store.phone", label: "Contact Phone", type: "text", description: "Support phone", permission: "settings.store_profile" },
  { group: "STORE_PROFILE", key: "store.address", label: "Business Address", type: "textarea", description: "Business location", permission: "settings.store_profile" },

  { group: "GENERAL", key: "general.currency", label: "Default Currency", type: "select", description: "Default store currency", permission: "settings.general" },
  { group: "GENERAL", key: "general.language", label: "Default Language", type: "select", description: "Default language", permission: "settings.general" },
  { group: "GENERAL", key: "general.timeZone", label: "Time Zone", type: "text", description: "Store time zone", permission: "settings.general" },
  { group: "GENERAL", key: "general.dateFormat", label: "Date Format", type: "text", description: "Date display format", permission: "settings.general" },
  { group: "GENERAL", key: "general.measurementUnit", label: "Measurement Unit", type: "select", description: "kg/lb/cm/inch", permission: "settings.general" },

  { group: "AI", key: "ai.assistantEnabled", label: "AI Assistant Enable", type: "boolean", description: "Enable AI assistant", permission: "settings.ai" },
  { group: "AI", key: "ai.model", label: "AI Model Selection", type: "select", description: "Default AI model", permission: "settings.ai" },
  { group: "AI", key: "ai.recommendations", label: "AI Product Recommendation", type: "boolean", description: "Enable AI recommendations", permission: "settings.ai" },
  { group: "AI", key: "ai.search", label: "AI Search", type: "boolean", description: "Enable AI search", permission: "settings.ai" },
  { group: "AI", key: "ai.contentGeneration", label: "AI Content Generation", type: "boolean", description: "Enable AI content tools", permission: "settings.ai" },
  { group: "AI", key: "ai.chatWidget", label: "AI Chat Widget", type: "boolean", description: "Enable storefront chat", permission: "settings.ai" },
  { group: "AI", key: "ai.personalizationLevel", label: "AI Personalization Level", type: "select", description: "LOW / MEDIUM / HIGH", permission: "settings.ai" },
  { group: "AI", key: "ai.analytics", label: "AI Analytics", type: "boolean", description: "Enable AI analytics", permission: "settings.ai" },

  { group: "PRODUCTS", key: "products.skuAutoGenerate", label: "SKU Auto Generate", type: "boolean", description: "Auto generate SKU", permission: "settings.products" },
  { group: "PRODUCTS", key: "products.inventoryTracking", label: "Inventory Tracking", type: "boolean", description: "Track inventory", permission: "settings.products" },
  { group: "PRODUCTS", key: "products.lowStockAlert", label: "Low Stock Alert", type: "boolean", description: "Alert low stock", permission: "settings.products" },
  { group: "PRODUCTS", key: "products.approvalWorkflow", label: "Product Approval Workflow", type: "boolean", description: "Require product approval", permission: "settings.products" },
  { group: "PRODUCTS", key: "products.reviewRating", label: "Review & Rating", type: "boolean", description: "Enable product reviews", permission: "settings.products" },
  { group: "PRODUCTS", key: "products.aiCategorization", label: "AI Auto Categorization", type: "boolean", description: "Auto categorize by AI", permission: "settings.products" },

  { group: "INVENTORY", key: "inventory.enabled", label: "Inventory Tracking", type: "boolean", description: "Enable inventory engine", permission: "settings.inventory" },
  { group: "INVENTORY", key: "inventory.lowStockThreshold", label: "Low Stock Threshold", type: "number", description: "Default low stock threshold", permission: "settings.inventory" },

  { group: "ORDERS", key: "orders.prefix", label: "Order Prefix", type: "text", description: "Order number prefix", permission: "settings.orders" },
  { group: "ORDERS", key: "orders.autoConfirm", label: "Auto Order Confirmation", type: "boolean", description: "Auto confirm orders", permission: "settings.orders" },
  { group: "ORDERS", key: "orders.autoInvoice", label: "Auto Invoice Generation", type: "boolean", description: "Generate invoices", permission: "settings.orders" },
  { group: "ORDERS", key: "orders.returnPolicy", label: "Return & Refund Policy", type: "textarea", description: "Return policy text", permission: "settings.orders" },

  { group: "CUSTOMERS", key: "customers.guestCheckout", label: "Allow Guest Checkout", type: "boolean", description: "Allow guest checkout", permission: "settings.customers" },
  { group: "CUSTOMERS", key: "customers.registration", label: "User Registration", type: "boolean", description: "Enable registration", permission: "settings.customers" },
  { group: "CUSTOMERS", key: "customers.emailVerification", label: "Email Verification Required", type: "boolean", description: "Require email verification", permission: "settings.customers" },

  { group: "MEMBERSHIP", key: "membership.enabled", label: "Membership Enable", type: "boolean", description: "Enable membership engine", permission: "settings.membership" },
  { group: "REWARDS", key: "rewards.enabled", label: "Rewards Enable", type: "boolean", description: "Enable rewards engine", permission: "settings.rewards" },

  { group: "PAYMENTS", key: "payments.cod", label: "Cash on Delivery", type: "boolean", description: "Enable COD", permission: "settings.payments" },
  { group: "PAYMENTS", key: "payments.bankTransfer", label: "Bank Transfer", type: "boolean", description: "Enable bank transfer", permission: "settings.payments" },
  { group: "PAYMENTS", key: "payments.mode", label: "Test / Live Mode", type: "select", description: "Payment mode", permission: "settings.payments" },

  { group: "SHIPPING", key: "shipping.freeRules", label: "Free Shipping Rules", type: "textarea", description: "Rules for free shipping", permission: "settings.shipping" },
  { group: "SHIPPING", key: "shipping.deliveryCharge", label: "Delivery Charges", type: "number", description: "Default delivery charge", permission: "settings.shipping" },
  { group: "SHIPPING", key: "shipping.estimatedTime", label: "Estimated Delivery Time", type: "text", description: "Delivery ETA", permission: "settings.shipping" },
  { group: "SHIPPING", key: "shipping.aiOptimization", label: "AI Shipping Optimization", type: "boolean", description: "Enable AI shipping optimization", permission: "settings.shipping" },

  { group: "TAX", key: "tax.rate", label: "Tax Rate", type: "number", description: "VAT/GST rate", permission: "settings.tax" },
  { group: "TAX", key: "tax.inclusive", label: "Tax Inclusive Pricing", type: "boolean", description: "Tax inclusive price", permission: "settings.tax" },

  { group: "MARKETING", key: "marketing.metaTitle", label: "Meta Title", type: "text", description: "Default SEO title", permission: "settings.marketing" },
  { group: "MARKETING", key: "marketing.metaDescription", label: "Meta Description", type: "textarea", description: "Default SEO description", permission: "settings.marketing" },
  { group: "MARKETING", key: "marketing.sitemap", label: "Sitemap", type: "boolean", description: "Enable sitemap", permission: "settings.marketing" },
  { group: "MARKETING", key: "marketing.robots", label: "Robots.txt", type: "textarea", description: "Robots content", permission: "settings.marketing" },

  { group: "NOTIFICATIONS", key: "notifications.email", label: "Email Notifications", type: "boolean", description: "Enable emails", permission: "settings.notifications" },
  { group: "NOTIFICATIONS", key: "notifications.sms", label: "SMS Notifications", type: "boolean", description: "Enable SMS", permission: "settings.notifications" },
  { group: "NOTIFICATIONS", key: "notifications.whatsapp", label: "WhatsApp Notifications", type: "boolean", description: "Enable WhatsApp", permission: "settings.notifications" },
  { group: "NOTIFICATIONS", key: "notifications.push", label: "Push Notifications", type: "boolean", description: "Enable push", permission: "settings.notifications" },

  { group: "SECURITY", key: "security.twoFactor", label: "Two-Factor Authentication", type: "boolean", description: "Enable 2FA", permission: "settings.security" },
  { group: "SECURITY", key: "security.passwordPolicy", label: "Password Policy", type: "textarea", description: "Password policy", permission: "settings.security" },
  { group: "SECURITY", key: "security.ipWhitelist", label: "IP Whitelist", type: "textarea", description: "Allowed IPs", permission: "settings.security" },
  { group: "SECURITY", key: "security.apiAccess", label: "API Access Control", type: "boolean", description: "Enable API control", permission: "settings.security" },

  { group: "INTEGRATIONS", key: "integrations.facebookPixel", label: "Facebook Pixel", type: "text", description: "Facebook Pixel ID", permission: "settings.integrations" },
  { group: "INTEGRATIONS", key: "integrations.googleAnalytics", label: "Google Analytics", type: "text", description: "GA ID", permission: "settings.integrations" },
  { group: "INTEGRATIONS", key: "integrations.gtm", label: "Google Tag Manager", type: "text", description: "GTM ID", permission: "settings.integrations" },
  { group: "INTEGRATIONS", key: "integrations.whatsappBusiness", label: "WhatsApp Business", type: "text", description: "WhatsApp Business ID", permission: "settings.integrations" },

  { group: "ANALYTICS", key: "analytics.salesPrediction", label: "Sales Prediction", type: "boolean", description: "Enable sales prediction", permission: "settings.analytics" },
  { group: "ANALYTICS", key: "analytics.demandForecasting", label: "Demand Forecasting", type: "boolean", description: "Enable demand forecasting", permission: "settings.analytics" },

  { group: "STAFF", key: "staff.roles", label: "User Roles", type: "boolean", description: "Enable role management", permission: "settings.staff" },
  { group: "STAFF", key: "staff.permissions", label: "Permissions", type: "boolean", description: "Enable permission matrix", permission: "settings.staff" },
  { group: "STAFF", key: "staff.activityLogs", label: "Activity Logs", type: "boolean", description: "Enable staff activity logs", permission: "settings.staff" },

  { group: "API", key: "api.keys", label: "API Keys", type: "textarea", description: "API keys", permission: "settings.api" },
  { group: "API", key: "api.webhooks", label: "Webhooks", type: "textarea", description: "Webhook endpoints", permission: "settings.api" },
  { group: "API", key: "api.rateLimits", label: "API Rate Limits", type: "number", description: "Rate limit", permission: "settings.api" },

  { group: "LEGAL", key: "legal.privacy", label: "Privacy Policy", type: "textarea", description: "Privacy policy", permission: "settings.legal" },
  { group: "LEGAL", key: "legal.terms", label: "Terms & Conditions", type: "textarea", description: "Terms content", permission: "settings.legal" },
  { group: "LEGAL", key: "legal.cookies", label: "Cookie Policy", type: "textarea", description: "Cookie policy", permission: "settings.legal" },

  { group: "BACKUP", key: "backup.autoSchedule", label: "Auto Backup Schedule", type: "text", description: "Backup schedule", permission: "settings.backup" },
  { group: "BACKUP", key: "backup.maintenanceMode", label: "Maintenance Mode", type: "boolean", description: "Enable maintenance mode", permission: "settings.backup" },
  { group: "BACKUP", key: "backup.healthMonitoring", label: "System Health Monitoring", type: "boolean", description: "Enable monitoring", permission: "settings.backup" },
  {
    group: "SIZE_FIT",
    key: "sizefit.enabled",
    label: "Enable Size & Fit Center",
    type: "boolean",
    description: "Enable storefront Size & Fit Center",
    permission: "settings.products",
  },

  {
    group: "SIZE_FIT",
    key: "sizefit.virtualTryOn",
    label: "Enable Virtual Try-On",
    type: "boolean",
    description: "Enable Virtual Try-On integration",
    permission: "settings.products",
  },

  {
    group: "SIZE_FIT",
    key: "sizefit.measurementGuide",
    label: "Enable Measurement Guide",
    type: "boolean",
    description: "Enable measurement guide section",
    permission: "settings.products",
  },

  {
    group: "SIZE_FIT",
    key: "sizefit.sizes",
    label: "Available Sizes",
    type: "textarea",
    description: "Comma separated sizes. Example: XS,S,M,L,XL,XXL,3XL",
    permission: "settings.products",
  },
];

export const seedSettingsV2Service = async () => {
  let sortOrder = 1;

  for (const item of settingDefinitions) {

    await prisma.settingDefinition.upsert({
      where: {
        key: item.key,
      },
      update: {
        group: item.group,
        label: item.label,
        type: item.type,
        description: item.description,
        permission: item.permission,
        sortOrder,
        visible: true,
      },
      create: {
        group: item.group,
        key: item.key,
        label: item.label,
        type: item.type,
        description: item.description,
        permission: item.permission,
        sortOrder,
        visible: true,
      },
    });

    sortOrder += 1;
  }

  return getSettingsV2Service();
};

export const getSettingsV2Service = async () => {
  const definitions = await prisma.settingDefinition.findMany({
    where: {
      visible: true,
    },
    orderBy: [
      {
        group: "asc",
      },
      {
        sortOrder: "asc",
      },
    ],
  });

  const values = await prisma.settingValue.findMany();

  const valueMap = new Map(
    values.map((item) => [item.key, item.value])
  );

  const groups: Record<string, any[]> = {};

  for (const item of definitions) {
    if (!groups[item.group]) {
      groups[item.group] = [];
    }

    groups[item.group]!.push({
      ...item,
      value: valueMap.get(item.key) ?? item.defaultValue ?? null,
    });
  }

  return groups;
};

export const updateSettingsV2Service = async (
  payload: Record<string, any>,
  updatedBy?: string
) => {
  const entries = Object.entries(payload);

  for (const [key, value] of entries) {
    const updatedByValue = updatedBy ?? null;

    await prisma.settingValue.upsert({
      where: {
        key,
      },
      update: {
        value,
        updatedBy: updatedByValue,
      },
      create: {
        key,
        value,
        updatedBy: updatedByValue,
      },
    });
  }

  return getSettingsV2Service();
};


