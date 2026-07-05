import { NextFunction, Request, Response } from "express";
import { OwnershipResource } from "./ownership.types";
import { ownershipGuard } from "./ownership.guard";

export function requireOwnership(resource: OwnershipResource, action = "read") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      ownershipGuard(req, resource, action);
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ownership denied";
      res.status(403).json({
        success: false,
        message: "Ownership denied",
        code: "OWNERSHIP_DENIED",
        reason: message,
      });
    }
  };
}

export const ownershipMiddleware = requireOwnership;

/**
 * PHASE 4.6B ENTERPRISE AUDIT NOTE:
 * Ownership denial branches must call auditScopeDenied(req, "ownership_denied", resource, reason).
 */
