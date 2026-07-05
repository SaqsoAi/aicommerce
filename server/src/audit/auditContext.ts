import type { Request } from "express";

export interface AuditContext {
  actorId?: string;
  actorRole?: string;
  tenantId?: string;
  storeId?: string;
  branchId?: string;
  warehouseId?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

function readAny(source: unknown, key: string): string | undefined {
  if (!source || typeof source !== "object") return undefined;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

export function buildAuditContext(req?: Request): AuditContext {
  if (!req) return {};

  const user = (req as unknown as { user?: unknown }).user;
  const scope = (req as unknown as { scope?: unknown }).scope;

  return {
    actorId: readAny(user, "id") ?? readAny(user, "userId") ?? readAny(req.headers, "x-actor-id"),
    actorRole: readAny(user, "role") ?? readAny(user, "roleName"),
    tenantId: readAny(scope, "tenantId") ?? readAny(user, "tenantId") ?? readAny(req.headers, "x-tenant-id"),
    storeId: readAny(scope, "storeId") ?? readAny(user, "storeId") ?? readAny(req.headers, "x-store-id"),
    branchId: readAny(scope, "branchId") ?? readAny(user, "branchId") ?? readAny(req.headers, "x-branch-id"),
    warehouseId: readAny(scope, "warehouseId") ?? readAny(user, "warehouseId") ?? readAny(req.headers, "x-warehouse-id"),
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    requestId: readAny(req.headers, "x-request-id"),
  };
}
