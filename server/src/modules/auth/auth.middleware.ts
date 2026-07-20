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

    const dbUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        tenantId: true,
        storeId: true,
      },
    });
    if (!dbUser) return res.status(401).json({ success: false, message: "User not found" });

    const role = String(dbUser.role || decoded.role || "").toUpperCase();
    const directPermissions = Array.isArray(dbUser.permissions)
      ? dbUser.permissions.map(String)
      : [];
    let rolePermissions: string[] = [];

    if (role !== "SUPER_ADMIN") {
      try {
        const roleRow = await prisma.role.findUnique({
          where: { name: role },
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        });
        rolePermissions = (roleRow?.permissions || [])
          .map((item) => item.permission?.code)
          .filter((value): value is string => Boolean(value));

        const explicitRows = await prisma.adminPermission.findMany({
          where: { userId: dbUser.id, allowed: true },
          select: { permissionCode: true },
        });
        rolePermissions.push(
          ...explicitRows.map((item) => item.permissionCode).filter(Boolean),
        );
      } catch (error) {
        console.warn("Role permissions unavailable", {
          role,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const permissions =
      role === "SUPER_ADMIN"
        ? ["*"]
        : [...new Set([...directPermissions, ...rolePermissions])];

    req.user = {
      ...decoded,
      id: dbUser.id,
      userId: dbUser.id,
      email: dbUser.email,
      role,
      permissions,
      tenantId: dbUser.tenantId || undefined,
      storeId: dbUser.storeId || undefined,
    } as any;
    return next();
  } catch (error) {
    console.warn("Authentication rejected", { error: error instanceof Error ? error.message : String(error) });
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const authenticate = protect;
export const requireAuth = protect;
