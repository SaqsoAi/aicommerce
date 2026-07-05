import type { NextFunction, Request, Response } from "express";
import { featureFlagService } from "./featureFlag.service";

function requestContext(req: Request) {
  const user = (req as any).user || {};
  return {
    tenantId: user.tenantId || req.headers["x-tenant-id"] || null,
    storeId: user.storeId || req.headers["x-store-id"] || null,
    role: user.role || null,
    environment: process.env.NODE_ENV || "development"
  };
}

export function requireFeature(flagKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (featureFlagService.resolve("system.maintenance", requestContext(req))) {
      return res.status(503).json({ success: false, code: "MAINTENANCE_MODE", message: "System is under maintenance." });
    }

    const readOnly = featureFlagService.resolve("system.read.only", requestContext(req));
    if (readOnly && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return res.status(423).json({ success: false, code: "READ_ONLY_MODE", message: "System is in read-only mode." });
    }

    if (!featureFlagService.resolve(flagKey, requestContext(req))) {
      return res.status(403).json({ success: false, code: "FEATURE_DISABLED", feature: flagKey });
    }

    return next();
  };
}
