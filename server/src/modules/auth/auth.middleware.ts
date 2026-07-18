import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";

export type AuthRequest = Request & {
  user?: { id?: string; userId?: string; email?: string | null; role?: string; permissions?: string[] };
};

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.customer_session || null;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not configured");
    const decoded = jwt.verify(token, secret) as { id?: string; userId?: string; role?: string };
    const id = decoded.id || decoded.userId;
    if (!id) return res.status(401).json({ success: false, message: "Invalid token subject" });

    const dbUser = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, role: true } });
    if (!dbUser) return res.status(401).json({ success: false, message: "User not found" });

    const role = String(dbUser.role || decoded.role || "").toUpperCase();
    let permissions: string[] = [];
    if (role === "SUPER_ADMIN") permissions = ["*"];
    else {
      try {
        const rows = await (prisma as any).rolePermission.findMany({ where: { role }, include: { permission: true } });
        permissions = rows.map((item: any) => item.permission?.key || item.permission?.name || item.permission?.code || item.permissionKey).filter(Boolean);
      } catch (error) {
        console.warn("Role permissions unavailable", { role, error: error instanceof Error ? error.message : String(error) });
      }
    }

    req.user = { ...decoded, id: dbUser.id, userId: dbUser.id, email: dbUser.email, role, permissions };
    return next();
  } catch (error) {
    console.warn("Authentication rejected", { error: error instanceof Error ? error.message : String(error) });
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const authenticate = protect;
export const requireAuth = protect;
