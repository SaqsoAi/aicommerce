import type { Request, Response, NextFunction } from "express";

type AuthUser = {
  id?: string;
  role?: string;
  permissions?: string[];
};

type RequestWithUser = Request & {
  user?: AuthUser;
};

export const permission =
  (...requiredPermissions: string[]) =>
  (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const role = String(user.role || "").toUpperCase();
    const permissions = Array.isArray(user.permissions) ? user.permissions : [];

    if (role === "SUPER_ADMIN" || permissions.includes("*")) {
      return next();
    }

    const allowed = requiredPermissions.every((p) => permissions.includes(p));

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
        requiredPermissions,
      });
    }

    return next();
  };

export const requirePermission = permission;


/**
 * PHASE 4.6B ENTERPRISE AUDIT NOTE:
 * Permission denial branches must call auditPermissionDenied(req, resource, reason)
 * from modules/audit-log/enterprise-audit.middleware before returning 403.
 */
