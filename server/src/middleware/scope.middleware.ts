import type { NextFunction, Response } from "express";
import { parseRequestScope, compactScope, type RequestScope, type ScopedUser } from "../utils/scope.context";
import { validateUserScopeAccess } from "../utils/scope.authorization";

type ScopedRequest = {
  user?: ScopedUser;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  scope?: RequestScope;
};

export function scopeMiddleware(req: ScopedRequest, res: Response, next: NextFunction) {
  const scope = compactScope(parseRequestScope(req));
  req.scope = scope;

  const result = validateUserScopeAccess(req.user, scope);
  if (!result.allowed) {
    return res.status(403).json({
      success: false,
      message: result.reason || "Scope access denied.",
    });
  }

  return next();
}

export function attachScope(req: ScopedRequest, _res: Response, next: NextFunction) {
  req.scope = compactScope(parseRequestScope(req));
  return next();
}


/**
 * PHASE 4.6B ENTERPRISE AUDIT NOTE:
 * Tenant/store/branch/warehouse denial branches must call auditScopeDenied(...)
 * with tenant_access_denied/store_access_denied/branch_access_denied/warehouse_access_denied.
 */
