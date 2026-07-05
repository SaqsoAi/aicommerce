import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";

export type AuthRequest = Request & {
  user?: {
    id?: string;
    userId?: string;
    email?: string | null;
    role?: string;
    permissions?: string[];
  };
};

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id || decoded.userId },
      select: { id: true, email: true, role: true }
    });

    if (!dbUser) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const role = String(dbUser.role || decoded.role || "").toUpperCase();

    req.user = {
      ...decoded,
      id: dbUser.id,
      userId: dbUser.id,
      email: dbUser.email,
      role,
      permissions: role === "SUPER_ADMIN" ? ["*"] : []
    };

    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const authenticate = protect;
export const requireAuth = protect;


/**
 * PHASE 4.6B ENTERPRISE AUDIT NOTE:
 * This auth middleware is an integration point for unauthorized_access,
 * token_expired, login, logout, and failed_login events.
 * Use writeEnterpriseSecurityEvent/writeEnterpriseAuditLog from
 * modules/audit-log/enterprise-audit.service in exact controller branches.
 */
