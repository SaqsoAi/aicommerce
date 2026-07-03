import {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;

    const header =
      req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token =
      header.startsWith("Bearer ")
        ? header.split(" ")[1]
        : header;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured",
      });
    }

    const decoded = jwt.verify(
      token,
      jwtSecret
    );

        const decodedUser = decoded as any;

    const dbUser = await prisma.user.findUnique({
      where: { id: decodedUser.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    let permissions: string[] = [];

    if (dbUser.role !== "SUPER_ADMIN") {
      try {
        const rolePermissions = await (prisma as any).rolePermission.findMany({
          where: { role: dbUser.role },
          include: { permission: true },
        });

        permissions = rolePermissions
          .map((item: any) =>
            item.permission?.key ||
            item.permission?.name ||
            item.permission?.code ||
            item.permission ||
            item.permissionKey
          )
          .filter(Boolean);
      } catch {
        permissions = [];
      }
    }

    authReq.user = {
      ...decodedUser,
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      permissions,
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

