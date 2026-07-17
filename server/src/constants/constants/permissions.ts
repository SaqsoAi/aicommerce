export const PERMISSIONS = {
  DASHBOARD_READ: "dashboard.read",

  CATALOG_READ: "catalog.read",
  CATALOG_MANAGE: "catalog.manage",

  PRODUCT_READ: "product.read",
  PRODUCT_CREATE: "product.create",
  PRODUCT_UPDATE: "product.update",
  PRODUCT_DELETE: "product.delete",

  INVENTORY_READ: "inventory.read",
  INVENTORY_MANAGE: "inventory.manage",

  SALES_READ: "sales.read",
  SALES_MANAGE: "sales.manage",

  ORDER_READ: "order.read",
  ORDER_UPDATE: "order.update",
  ORDER_MANAGE: "order.manage",

  CUSTOMER_READ: "customer.read",
  CUSTOMER_MANAGE: "customer.manage",

  CONTENT_READ: "content.read",
  CONTENT_MANAGE: "content.manage",
  LOOKBOOK_READ: "lookbook.read",
  LOOKBOOK_MANAGE: "lookbook.manage",


  OMNICHANNEL_READ: "omnichannel.read",
  OMNICHANNEL_MANAGE: "omnichannel.manage",
  OMNICHANNEL_ANALYTICS: "omnichannel.analytics",
  OMNICHANNEL_ROUTING: "omnichannel.routing",
  MARKETING_READ: "marketing.read",
  MARKETING_MANAGE: "marketing.manage",

  MEDIA_READ: "media.read",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_MANAGE: "media.manage",

  MEMBERSHIP_READ: "membership.read",
  MEMBERSHIP_MANAGE: "membership.manage",
  MEMBERSHIP_ISSUE: "membership.issue",

  REWARD_READ: "reward.read",
  REWARD_MANAGE: "reward.manage",

  SETTINGS_READ: "settings.read",
  SETTINGS_MANAGE: "settings.manage",

  ROLE_READ: "role.read",
  ROLE_MANAGE: "role.manage",

  STAFF_READ: "staff.read",
  STAFF_MANAGE: "staff.manage",

  AI_READ: "ai.read",
  AI_MANAGE: "ai.manage",
  AI_USE: "ai.use",
  AI_ADMIN: "ai.admin",

  FEATURE_READ: "feature.read",
  FEATURE_MANAGE: "feature.manage",

  SUBSCRIPTION_READ: "subscription.read",
  SUBSCRIPTION_MANAGE: "subscription.manage",

  BILLING_READ: "billing.read",
  BILLING_MANAGE: "billing.manage",

  EMAIL_PROVIDER_READ: "email_provider.read",
  EMAIL_PROVIDER_MANAGE: "email_provider.manage",
  PUSH_PROVIDER_READ: "push_provider.read",
  PUSH_PROVIDER_MANAGE: "push_provider.manage",
  PROVIDER_HEALTH_READ: "provider_health.read",
  PROVIDER_HEALTH_MANAGE: "provider_health.manage",
  INTEGRATION_READ: "integration.read",
  INTEGRATION_MANAGE: "integration.manage",

  ERP_READ: "erp.read",
  ERP_MANAGE: "erp.manage",

  NOTIFICATION_VIEW: "notification.view",
  NOTIFICATION_MANAGE: "notification.manage",
  NOTIFICATION_ANALYTICS: "notification.analytics",
  NOTIFICATION_TEMPLATE: "notification.template",
  NOTIFICATION_PREFERENCE: "notification.preference",

  AUDIT_READ: "audit.read",
  BACKUP_MANAGE: "backup.manage",
  API_MANAGE: "api.manage",
} as const;

export type PermissionValue =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];




// PHASE_4_0I_O_WORKFLOW_PERMISSIONS
export const WORKFLOW_PERMISSIONS = {
  WORKFLOW_VIEW: "WORKFLOW_VIEW",
  WORKFLOW_MANAGE: "WORKFLOW_MANAGE",
  WORKFLOW_EXECUTE: "WORKFLOW_EXECUTE",
  WORKFLOW_FULL: "WORKFLOW_FULL",
} as const;

export const ENTERPRISE_AUTH_PERMISSIONS = {
  AUTH_SESSION_VIEW: "AUTH_SESSION_VIEW",
  AUTH_SESSION_MANAGE: "AUTH_SESSION_MANAGE",
  AUTH_DEVICE_VIEW: "AUTH_DEVICE_VIEW",
  AUTH_DEVICE_MANAGE: "AUTH_DEVICE_MANAGE",
  AUTH_2FA_MANAGE: "AUTH_2FA_MANAGE",
  AUTH_SECURITY_POLICY_MANAGE: "AUTH_SECURITY_POLICY_MANAGE",
  AUTH_LOGIN_HISTORY_VIEW: "AUTH_LOGIN_HISTORY_VIEW",
  AUTH_FORCE_LOGOUT: "AUTH_FORCE_LOGOUT",
} as const;
