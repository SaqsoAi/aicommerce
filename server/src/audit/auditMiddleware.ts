import type { NextFunction, Request, Response } from "express";
import { AUDIT_EVENT_TYPES } from "./auditEventTypes";
import { writeSecurityEvent } from "./securityEventLogger";

export function auditUnauthorizedAccess(resource: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as unknown as { user?: unknown }).user;
    if (!user) {
      await writeSecurityEvent({
        req,
        eventType: AUDIT_EVENT_TYPES.UNAUTHORIZED_ACCESS,
        resource,
        reason: "Missing authenticated user context",
      });
    }
    next();
  };
}

export async function logPermissionDenied(req: Request, resource: string, reason: string): Promise<void> {
  await writeSecurityEvent({
    req,
    eventType: AUDIT_EVENT_TYPES.PERMISSION_DENIED,
    resource,
    reason,
  });
}

export async function logScopeDenied(
  req: Request,
  eventType: string,
  resource: string,
  reason: string,
): Promise<void> {
  await writeSecurityEvent({
    req,
    eventType,
    resource,
    reason,
  });
}
