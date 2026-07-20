import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../modules/auth/auth.middleware";

export type AuthorizationRequest = AuthRequest & {
  authContext?: {
    userId: string;
    role: string;
    permissions: string[];
    tenantId?: string;
    storeId?: string;
    platformAccess: boolean;
  };
};

function normalize(value: unknown): string {
  return String(value ?? "").trim().toUpperCase().replace(/[-\s]+/g, "_");
}

function unauthorized(res: Response, code = "UNAUTHENTICATED") {
  return res.status(401).json({ success: false, error: { code, message: "Authentication required" } });
}

function forbidden(res: Response, code: string, details?: unknown) {
  return res.status(403).json({ success: false, error: { code, message: "Permission denied", details } });
}

export function requireAuthenticated(req: AuthorizationRequest, res: Response, next: NextFunction) {
  if (!req.user?.id && !req.user?.userId) return unauthorized(res);
  const role = normalize(req.user.role);
  const permissions = Array.isArray(req.user.permissions) ? req.user.permissions.map(String) : [];
  req.authContext = {
    userId: String(req.user.id ?? req.user.userId),
    role,
    permissions,
    tenantId: String((req.user as any).tenantId ?? "") || undefined,
    storeId: String((req.user as any).storeId ?? "") || undefined,
    platformAccess: role === "SUPER_ADMIN",
  };
  return next();
}

export const requirePlatformAdmin = [
  requireAuthenticated,
  (req: AuthorizationRequest, res: Response, next: NextFunction) =>
    req.authContext?.role === "SUPER_ADMIN" ? next() : forbidden(res, "PLATFORM_ADMIN_REQUIRED"),
];

export function requireRole(...roles: string[]) {
  const allowed = new Set(roles.map(normalize));
  return [
    requireAuthenticated,
    (req: AuthorizationRequest, res: Response, next: NextFunction) =>
      req.authContext?.role && allowed.has(req.authContext.role)
        ? next()
        : forbidden(res, "ROLE_REQUIRED", { roles: [...allowed] }),
  ];
}

export function requirePermission(...required: string[]) {
  return [
    requireAuthenticated,
    (req: AuthorizationRequest, res: Response, next: NextFunction) => {
      const context = req.authContext!;
      if (context.platformAccess || context.permissions.includes("*")) return next();
      const permissionSet = new Set(context.permissions);
      const aliases: Record<string, string[]> = {
        "product.create": ["products.manage", "catalog.manage"],
        "product.update": ["products.manage", "catalog.manage"],
        "product.delete": ["products.manage", "catalog.manage"],
        "product.read": ["products.manage", "catalog.read", "catalog.manage"],
        "media.upload": ["products.manage", "media.manage"],
        "media.read": ["products.manage", "media.manage"],
        "catalog.manage": ["categories.manage", "products.manage"],
        "categories.manage": ["catalog.manage"],
        "categories.read": ["catalog.read", "catalog.manage", "categories.manage"],
      };

      const commerceRoleFallback: Record<string, Set<string>> = {
        ADMIN: new Set([
          "catalog.manage",
          "categories.manage",
          "categories.read",
          "product.read",
          "product.create",
          "product.update",
          "product.delete",
          "media.read",
          "media.upload",
          "media.manage",
        ]),
        TENANT_ADMIN: new Set([
          "catalog.manage",
          "categories.manage",
          "categories.read",
          "product.read",
          "product.create",
          "product.update",
          "product.delete",
          "media.read",
          "media.upload",
          "media.manage",
        ]),
        MANAGER: new Set([
          "catalog.manage",
          "categories.manage",
          "categories.read",
          "product.read",
          "product.create",
          "product.update",
          "media.read",
          "media.upload",
        ]),
      };

      const roleFallback = commerceRoleFallback[context.role];

      const missing = required.filter((permission) => {
        if (permissionSet.has(permission)) return false;
        if (
          (aliases[permission] || []).some((alias) =>
            permissionSet.has(alias),
          )
        ) {
          return false;
        }

        // Focused 2026.43.3 recovery:
        // existing Admin/Tenant Admin/Manager commerce roles may create products
        // while the legacy permission records are being normalized.
        if (roleFallback?.has(permission)) return false;

        return true;
      });

      return missing.length
        ? forbidden(res, "PERMISSION_REQUIRED", {
            missing,
            role: context.role,
          })
        : next();
    },
  ];
}

export const requireTenantContext = [
  requireAuthenticated,
  (req: AuthorizationRequest, res: Response, next: NextFunction) =>
    req.authContext?.platformAccess || req.authContext?.tenantId
      ? next()
      : forbidden(res, "TENANT_CONTEXT_REQUIRED"),
];

export const requireStoreContext = [
  requireAuthenticated,
  (req: AuthorizationRequest, res: Response, next: NextFunction) =>
    req.authContext?.platformAccess || req.authContext?.storeId
      ? next()
      : forbidden(res, "STORE_CONTEXT_REQUIRED"),
];
