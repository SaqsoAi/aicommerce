export const AUDIT_EVENT_TYPES = {
  LOGIN: "login",
  LOGOUT: "logout",
  FAILED_LOGIN: "failed_login",
  PASSWORD_RESET_REQUEST: "password_reset_request",
  PASSWORD_RESET_COMPLETE: "password_reset_complete",
  TOKEN_EXPIRED: "token_expired",
  UNAUTHORIZED_ACCESS: "unauthorized_access",

  ROLE_CREATED: "role_created",
  ROLE_UPDATED: "role_updated",
  ROLE_DELETED: "role_deleted",
  ROLE_ASSIGNED: "role_assigned",
  ROLE_REMOVED: "role_removed",
  PERMISSION_ASSIGNED: "permission_assigned",
  PERMISSION_REMOVED: "permission_removed",
  PERMISSION_DENIED: "permission_denied",

  TENANT_ACCESS_DENIED: "tenant_access_denied",
  STORE_ACCESS_DENIED: "store_access_denied",
  BRANCH_ACCESS_DENIED: "branch_access_denied",
  WAREHOUSE_ACCESS_DENIED: "warehouse_access_denied",
  OWNERSHIP_DENIED: "ownership_denied",

  SETTINGS_UPDATED: "settings_updated",
  STORE_SETTINGS_UPDATED: "store_settings_updated",
  THEME_UPDATED: "theme_updated",
  TEMPLATE_UPDATED: "template_updated",
  MEDIA_UPLOADED: "media_uploaded",
  MEDIA_DELETED: "media_deleted",

  PRODUCT_CREATED: "product_created",
  PRODUCT_UPDATED: "product_updated",
  PRODUCT_DELETED: "product_deleted",
  ORDER_STATUS_UPDATED: "order_status_updated",
  REFUND_CREATED: "refund_created",
  RETURN_CREATED: "return_created",
  INVENTORY_ADJUSTED: "inventory_adjusted",
  PURCHASE_UPDATED: "purchase_updated",

  AI_REQUEST_CREATED: "ai_request_created",
  AI_REQUEST_FAILED: "ai_request_failed",
  AI_SETTINGS_UPDATED: "ai_settings_updated",
  AI_PROVIDER_UPDATED: "ai_provider_updated",
} as const;

export type AuditEventType = typeof AUDIT_EVENT_TYPES[keyof typeof AUDIT_EVENT_TYPES];

export type AuditResult = "success" | "failure" | "denied";
