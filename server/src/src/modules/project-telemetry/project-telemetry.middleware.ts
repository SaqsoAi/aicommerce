import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Response } from "express";
import { protect, type AuthRequest } from "../auth/auth.middleware";

function secureEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function authorizeTelemetry(req: AuthRequest, res: Response, next: NextFunction) {
  const configuredToken = process.env.TELEMETRY_INGEST_TOKEN?.trim();
  const authorization = req.headers.authorization || "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (configuredToken && bearer && secureEqual(configuredToken, bearer)) {
    return next();
  }

  return protect(req, res, () => {
    if (String(req.user?.role || "").toUpperCase() !== "SUPER_ADMIN") {
      return res.status(403).json({ success: false, message: "Super Admin access required" });
    }
    return next();
  });
}
