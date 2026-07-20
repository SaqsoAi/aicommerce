import express, { type NextFunction, type Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";
import {
  protect,
  type AuthRequest,
} from "../auth/auth.middleware";

const router = express.Router();

const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "INVENTORY",
  "MARKETING",
  "SUPPORT",
  "WAREHOUSE_MANAGER",
  "DELIVERY_MANAGER",
  "FINANCE_MANAGER",
  "CUSTOMER",
] as const;

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  permissions: true,
  tenantId: true,
  storeId: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  tenant: { select: { id: true, name: true, slug: true } },
  store: { select: { id: true, name: true, status: true } },
} as const;

function superAdminOnly(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (String(req.user?.role || "").toUpperCase() !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      code: "SUPER_ADMIN_REQUIRED",
      message: "Super Admin access is required.",
    });
  }
  return next();
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(text).filter(Boolean))].sort();
}

function validRole(value: unknown): string {
  const role = text(value).toUpperCase();
  if (!(USER_ROLES as readonly string[]).includes(role)) {
    throw Object.assign(new Error(`Unsupported role: ${role}`), {
      statusCode: 400,
      code: "INVALID_ROLE",
    });
  }
  return role;
}

function failure(error: any, res: Response) {
  return res.status(Number(error?.statusCode || 500)).json({
    success: false,
    code: error?.code || "ACCESS_GOVERNANCE_ERROR",
    message: error?.message || "Access governance operation failed.",
  });
}

router.use(protect, superAdminOnly);

router.get("/health", async (_req, res) => {
  return res.json({
    success: true,
    module: "super-admin-center",
    mode: "access-governance-2026.43.4",
  });
});

router.get("/catalog", async (_req, res) => {
  try {
    const [roles, permissions, tenants] = await Promise.all([
      prisma.role.findMany({
        orderBy: { name: "asc" },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      }),
      prisma.permission.findMany({
        orderBy: { code: "asc" },
      }),
      prisma.tenant.findMany({
        orderBy: { name: "asc" },
        include: {
          stores: {
            orderBy: { name: "asc" },
            select: { id: true, name: true, status: true },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        userRoles: USER_ROLES,
        roles: roles.map((role) => ({
          ...role,
          permissionCodes: role.permissions
            .map((item) => item.permission.code)
            .sort(),
        })),
        permissions,
        tenants,
      },
    });
  } catch (error) {
    return failure(error, res);
  }
});

/* ---------------- Permissions ---------------- */

router.get("/permissions", async (_req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { code: "asc" },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
    return res.json({ success: true, data: permissions });
  } catch (error) {
    return failure(error, res);
  }
});

router.post("/permissions", async (req, res) => {
  try {
    const code = text(req.body?.code).toLowerCase();
    const name = text(req.body?.name);
    const description = text(req.body?.description) || null;

    if (!/^[a-z0-9]+(?:[._:-][a-z0-9]+)*$/.test(code)) {
      throw Object.assign(
        new Error("Permission code must use lowercase dot notation."),
        { statusCode: 400, code: "INVALID_PERMISSION_CODE" },
      );
    }
    if (!name) {
      throw Object.assign(new Error("Permission name is required."), {
        statusCode: 400,
        code: "PERMISSION_NAME_REQUIRED",
      });
    }

    const permission = await prisma.permission.create({
      data: { code, name, description },
    });
    return res.status(201).json({ success: true, data: permission });
  } catch (error) {
    return failure(error, res);
  }
});

router.patch("/permissions/:id", async (req, res) => {
  try {
    const permission = await prisma.permission.update({
      where: { id: text(req.params.id) },
      data: {
        ...(req.body?.name !== undefined
          ? { name: text(req.body.name) }
          : {}),
        ...(req.body?.description !== undefined
          ? { description: text(req.body.description) || null }
          : {}),
      },
    });
    return res.json({ success: true, data: permission });
  } catch (error) {
    return failure(error, res);
  }
});

router.delete("/permissions/:id", async (req, res) => {
  try {
    const id = text(req.params.id);
    const used = await prisma.rolePermission.count({
      where: { permissionId: id },
    });
    if (used > 0) {
      return res.status(409).json({
        success: false,
        code: "PERMISSION_IN_USE",
        message: "Remove this permission from all roles before deleting it.",
        data: { roleAssignments: used },
      });
    }
    await prisma.permission.delete({ where: { id } });
    return res.json({ success: true, message: "Permission deleted." });
  } catch (error) {
    return failure(error, res);
  }
});

/* ---------------- Roles ---------------- */

router.get("/roles", async (_req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
    return res.json({
      success: true,
      data: roles.map((role) => ({
        ...role,
        permissionCodes: role.permissions
          .map((item) => item.permission.code)
          .sort(),
      })),
    });
  } catch (error) {
    return failure(error, res);
  }
});

router.post("/roles", async (req, res) => {
  try {
    const name = text(req.body?.name).toUpperCase();
    const description = text(req.body?.description) || null;
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      throw Object.assign(
        new Error("Role name must use uppercase underscore format."),
        { statusCode: 400, code: "INVALID_ROLE_NAME" },
      );
    }
    const role = await prisma.role.create({
      data: { name, description },
    });
    return res.status(201).json({ success: true, data: role });
  } catch (error) {
    return failure(error, res);
  }
});

router.patch("/roles/:id", async (req, res) => {
  try {
    const role = await prisma.role.update({
      where: { id: text(req.params.id) },
      data: {
        ...(req.body?.description !== undefined
          ? { description: text(req.body.description) || null }
          : {}),
      },
    });
    return res.json({ success: true, data: role });
  } catch (error) {
    return failure(error, res);
  }
});

router.put("/roles/:id/permissions", async (req, res) => {
  try {
    const roleId = text(req.params.id);
    const permissionCodes = uniqueStrings(req.body?.permissionCodes);

    const permissions = await prisma.permission.findMany({
      where: { code: { in: permissionCodes } },
      select: { id: true, code: true },
    });

    const missing = permissionCodes.filter(
      (code) => !permissions.some((item) => item.code === code),
    );
    if (missing.length) {
      return res.status(400).json({
        success: false,
        code: "UNKNOWN_PERMISSIONS",
        message: "Some permission codes do not exist.",
        data: { missing },
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (permissions.length) {
        await tx.rolePermission.createMany({
          data: permissions.map((permission) => ({
            roleId,
            permissionId: permission.id,
          })),
          skipDuplicates: true,
        });
      }
    });

    return res.json({
      success: true,
      data: { roleId, permissionCodes },
    });
  } catch (error) {
    return failure(error, res);
  }
});

router.delete("/roles/:id", async (req, res) => {
  try {
    const id = text(req.params.id);
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role was not found.",
      });
    }
    if ((USER_ROLES as readonly string[]).includes(role.name)) {
      return res.status(409).json({
        success: false,
        code: "SYSTEM_ROLE_PROTECTED",
        message: "Built-in application roles cannot be deleted.",
      });
    }
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: id } }),
      prisma.role.delete({ where: { id } }),
    ]);
    return res.json({ success: true, message: "Role deleted." });
  } catch (error) {
    return failure(error, res);
  }
});

/* ---------------- Users ---------------- */

router.get("/users", async (req, res) => {
  try {
    const query = text(req.query.q);
    const role = text(req.query.role).toUpperCase();

    const users = await prisma.user.findMany({
      take: 500,
      orderBy: { createdAt: "desc" },
      where: {
        ...(role ? { role: role as any } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { phone: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: SAFE_USER_SELECT,
    });

    return res.json({ success: true, data: users });
  } catch (error) {
    return failure(error, res);
  }
});

router.post("/users", async (req, res) => {
  try {
    const name = text(req.body?.name);
    const email = text(req.body?.email).toLowerCase();
    const phone = text(req.body?.phone) || null;
    const password = text(req.body?.password);
    const role = validRole(req.body?.role || "ADMIN");
    const permissions = uniqueStrings(req.body?.permissions);
    const tenantId = text(req.body?.tenantId) || null;
    const storeId = text(req.body?.storeId) || null;

    if (!name || !email || password.length < 8) {
      return res.status(400).json({
        success: false,
        code: "INVALID_USER_INPUT",
        message:
          "Name, email and a password of at least 8 characters are required.",
      });
    }

    if (storeId && !tenantId) {
      return res.status(400).json({
        success: false,
        code: "TENANT_REQUIRED",
        message: "A tenant is required when assigning a store.",
      });
    }

    if (storeId) {
      const store = await prisma.store.findFirst({
        where: { id: storeId, tenantId },
      });
      if (!store) {
        return res.status(400).json({
          success: false,
          code: "STORE_TENANT_MISMATCH",
          message: "Selected store does not belong to the selected tenant.",
        });
      }
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({
        success: false,
        code: "USER_EMAIL_EXISTS",
        message: "A user already exists with this email.",
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: await bcrypt.hash(password, 10),
        role: role as any,
        permissions,
        tenantId,
        storeId,
      },
      select: SAFE_USER_SELECT,
    });

    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    return failure(error, res);
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const id = text(req.params.id);
    const tenantId =
      req.body?.tenantId !== undefined
        ? text(req.body.tenantId) || null
        : undefined;
    const storeId =
      req.body?.storeId !== undefined
        ? text(req.body.storeId) || null
        : undefined;

    if (storeId && !tenantId) {
      return res.status(400).json({
        success: false,
        code: "TENANT_REQUIRED",
        message: "A tenant is required when assigning a store.",
      });
    }

    if (storeId) {
      const store = await prisma.store.findFirst({
        where: { id: storeId, tenantId },
      });
      if (!store) {
        return res.status(400).json({
          success: false,
          code: "STORE_TENANT_MISMATCH",
          message: "Selected store does not belong to the selected tenant.",
        });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(req.body?.name !== undefined
          ? { name: text(req.body.name) }
          : {}),
        ...(req.body?.phone !== undefined
          ? { phone: text(req.body.phone) || null }
          : {}),
        ...(req.body?.role !== undefined
          ? { role: validRole(req.body.role) as any }
          : {}),
        ...(req.body?.permissions !== undefined
          ? { permissions: uniqueStrings(req.body.permissions) }
          : {}),
        ...(tenantId !== undefined ? { tenantId } : {}),
        ...(storeId !== undefined ? { storeId } : {}),
        ...(req.body?.emailVerified !== undefined
          ? { emailVerified: Boolean(req.body.emailVerified) }
          : {}),
      },
      select: SAFE_USER_SELECT,
    });

    return res.json({ success: true, data: user });
  } catch (error) {
    return failure(error, res);
  }
});

router.put("/users/:id/permissions", async (req, res) => {
  try {
    const permissions = uniqueStrings(req.body?.permissions);
    const known = await prisma.permission.findMany({
      where: { code: { in: permissions } },
      select: { code: true },
    });
    const missing = permissions.filter(
      (code) => !known.some((item) => item.code === code),
    );
    if (missing.length) {
      return res.status(400).json({
        success: false,
        code: "UNKNOWN_PERMISSIONS",
        message: "Some permission codes do not exist.",
        data: { missing },
      });
    }

    const user = await prisma.user.update({
      where: { id: text(req.params.id) },
      data: { permissions },
      select: SAFE_USER_SELECT,
    });

    return res.json({ success: true, data: user });
  } catch (error) {
    return failure(error, res);
  }
});

router.patch("/users/:id/reset-password", async (req, res) => {
  try {
    const password = text(req.body?.password);
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        code: "PASSWORD_TOO_SHORT",
        message: "Password must be at least 8 characters.",
      });
    }

    await prisma.user.update({
      where: { id: text(req.params.id) },
      data: { password: await bcrypt.hash(password, 10) },
    });

    return res.json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    return failure(error, res);
  }
});

router.delete("/users/:id", async (req: AuthRequest, res) => {
  try {
    const id = text(req.params.id);
    if (id === req.user?.id) {
      return res.status(409).json({
        success: false,
        code: "SELF_DELETE_BLOCKED",
        message: "You cannot delete your own active account.",
      });
    }

    const operationalOrders = await prisma.order.count({
      where: { userId: id },
    });

    if (operationalOrders > 0) {
      return res.status(409).json({
        success: false,
        code: "USER_HAS_ORDERS",
        message:
          "User has historical orders. Remove role/store access instead of deleting.",
        data: { orders: operationalOrders },
      });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ success: true, message: "User deleted." });
  } catch (error) {
    return failure(error, res);
  }
});

router.get("/feature-flags", async (_req, res) => {
  try {
    const flags = await prisma.featureFlag.findMany({ take: 200 });
    return res.json({ success: true, data: flags });
  } catch (error) {
    return failure(error, res);
  }
});

router.get("/provider-control", async (_req, res) => {
  try {
    const providers = await prisma.authProvider.findMany({
      include: { settings: true },
    });
    return res.json({ success: true, data: providers });
  } catch (error) {
    return failure(error, res);
  }
});

export default router;
