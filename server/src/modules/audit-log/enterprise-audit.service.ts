import { PrismaClient } from "@prisma/client";
import type { Request } from "express";

const prisma = new PrismaClient();

export type EnterpriseAuditResult = "success" | "failure" | "denied";

export const ENTERPRISE_AUDIT_EVENTS = {
  login: "login",
  logout: "logout",
  failed_login: "failed_login",
  password_reset_request: "password_reset_request",
  password_reset_complete: "password_reset_complete",
  token_expired: "token_expired",
  unauthorized_access: "unauthorized_access",

  role_created: "role_created",
  role_updated: "role_updated",
  role_deleted: "role_deleted",
  role_assigned: "role_assigned",
  role_removed: "role_removed",
  permission_assigned: "permission_assigned",
  permission_removed: "permission_removed",
  permission_denied: "permission_denied",

  tenant_access_denied: "tenant_access_denied",
  store_access_denied: "store_access_denied",
  branch_access_denied: "branch_access_denied",
  warehouse_access_denied: "warehouse_access_denied",
  ownership_denied: "ownership_denied",

  settings_updated: "settings_updated",
  store_settings_updated: "store_settings_updated",
  theme_updated: "theme_updated",
  template_updated: "template_updated",
  media_uploaded: "media_uploaded",
  media_deleted: "media_deleted",

  product_created: "product_created",
  product_updated: "product_updated",
  product_deleted: "product_deleted",
  order_status_updated: "order_status_updated",
  refund_created: "refund_created",
  return_created: "return_created",
  inventory_adjusted: "inventory_adjusted",
  purchase_updated: "purchase_updated",

  ai_request_created: "ai_request_created",
  ai_request_failed: "ai_request_failed",
  ai_settings_updated: "ai_settings_updated",
  ai_provider_updated: "ai_provider_updated",
} as const;

const SECRET_KEYS = [
  "password", "pass", "token", "jwt", "authorization", "secret",
  "apikey", "apiKey", "api_key", "creditcard", "cardnumber",
  "cvv", "cvc", "prompt", "rawprompt", "fullprompt"
];

function blocked(key: string): boolean {
  const k = key.toLowerCase();
  return SECRET_KEYS.some((s) => k.includes(s.toLowerCase()));
}

export function sanitizeEnterpriseAuditMetadata(input: unknown, depth = 0): unknown {
  if (input === null || input === undefined) return input;
  if (depth > 4) return "[MaxDepth]";
  if (typeof input === "string") return input.length > 500 ? `${input.slice(0, 500)}...[truncated]` : input;
  if (typeof input === "number" || typeof input === "boolean") return input;
  if (Array.isArray(input)) return input.slice(0, 25).map((x) => sanitizeEnterpriseAuditMetadata(x, depth + 1));
  if (typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = blocked(k) ? "[REDACTED]" : sanitizeEnterpriseAuditMetadata(v, depth + 1);
    }
    return out;
  }
  return "[Unsupported]";
}

function read(source: unknown, key: string): string | undefined {
  if (!source || typeof source !== "object") return undefined;
  const v = (source as Record<string, unknown>)[key];
  return typeof v === "string" || typeof v === "number" ? String(v) : undefined;
}

export function buildEnterpriseAuditContext(req?: Request) {
  if (!req) return {};
  const user = (req as unknown as { user?: unknown }).user;
  const scope = (req as unknown as { scope?: unknown }).scope;

  return {
    actorId: read(user, "id") ?? read(user, "userId"),
    actorRole: read(user, "role") ?? read(user, "roleName"),
    tenantId: read(scope, "tenantId") ?? read(user, "tenantId") ?? read(req.headers, "x-tenant-id"),
    storeId: read(scope, "storeId") ?? read(user, "storeId") ?? read(req.headers, "x-store-id"),
    branchId: read(scope, "branchId") ?? read(user, "branchId") ?? read(req.headers, "x-branch-id"),
    warehouseId: read(scope, "warehouseId") ?? read(user, "warehouseId") ?? read(req.headers, "x-warehouse-id"),
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    requestId: read(req.headers, "x-request-id"),
  };
}

function compact<T extends Record<string, unknown>>(obj: T): T {
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined || obj[key] === null || obj[key] === "") delete obj[key];
  }
  return obj;
}

export async function writeEnterpriseAuditLog(input: {
  req?: Request;
  eventType: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  result?: EnterpriseAuditResult;
  reason?: string;
  metadata?: unknown;
  context?: Record<string, unknown>;
}) {
  try {
    const ctx = { ...buildEnterpriseAuditContext(input.req), ...(input.context ?? {}) };
    await (prisma as any).auditLog.create({
      data: compact({
        eventType: input.eventType,
        action: input.action ?? input.eventType,
        resource: input.resource,
        resourceId: input.resourceId,
        result: input.result ?? "success",
        reason: input.reason,
        actorId: ctx.actorId,
        actorRole: ctx.actorRole,
        tenantId: ctx.tenantId,
        storeId: ctx.storeId,
        branchId: ctx.branchId,
        warehouseId: ctx.warehouseId,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
        metadata: sanitizeEnterpriseAuditMetadata(input.metadata ?? {}),
      }),
    });
  } catch (error) {
    console.error("[enterprise-audit] audit log failed", error);
  }
}

export async function writeEnterpriseSecurityEvent(input: {
  req?: Request;
  eventType: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  reason?: string;
  metadata?: unknown;
  context?: Record<string, unknown>;
}) {
  try {
    const ctx = { ...buildEnterpriseAuditContext(input.req), ...(input.context ?? {}) };
    const data = compact({
      eventType: input.eventType,
      action: input.action ?? input.eventType,
      resource: input.resource,
      resourceId: input.resourceId,
      result: "denied",
      reason: input.reason,
      actorId: ctx.actorId,
      actorRole: ctx.actorRole,
      tenantId: ctx.tenantId,
      storeId: ctx.storeId,
      branchId: ctx.branchId,
      warehouseId: ctx.warehouseId,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
      metadata: sanitizeEnterpriseAuditMetadata(input.metadata ?? {}),
    });

    await (prisma as any).securityEvent.create({ data });
    await writeEnterpriseAuditLog({ ...input, result: "denied" });
  } catch (error) {
    console.error("[enterprise-audit] security event failed", error);
  }
}
