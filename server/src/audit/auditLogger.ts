import { PrismaClient } from "@prisma/client";
import type { Request } from "express";
import type { AuditEventType, AuditResult } from "./auditEventTypes";
import { buildAuditContext, type AuditContext } from "./auditContext";
import { sanitizeAuditMetadata } from "./auditMetadataSanitizer";

const prisma = new PrismaClient();

export interface AuditLogInput {
  eventType: AuditEventType | string;
  action?: string;
  resource?: string;
  resourceId?: string;
  result?: AuditResult;
  reason?: string;
  metadata?: unknown;
  context?: AuditContext;
  req?: Request;
}

function compact<T extends Record<string, unknown>>(input: T): T {
  for (const key of Object.keys(input)) {
    if (input[key] === undefined || input[key] === null || input[key] === "") {
      delete input[key];
    }
  }
  return input;
}

export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  try {
    const context = { ...buildAuditContext(input.req), ...(input.context ?? {}) };
    const payload = compact({
      eventType: input.eventType,
      action: input.action ?? input.eventType,
      resource: input.resource,
      resourceId: input.resourceId,
      result: input.result ?? "success",
      reason: input.reason,
      actorId: context.actorId,
      actorRole: context.actorRole,
      tenantId: context.tenantId,
      storeId: context.storeId,
      branchId: context.branchId,
      warehouseId: context.warehouseId,
      ip: context.ip,
      userAgent: context.userAgent,
      requestId: context.requestId,
      metadata: sanitizeAuditMetadata(input.metadata ?? {}),
    });

    await (prisma as any).auditLog.create({ data: payload });
  } catch (error) {
    console.error("[audit] writeAuditLog failed", error);
  }
}
