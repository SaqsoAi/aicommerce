import express from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

const SAFE_USER_SELECT: any = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

router.get("/health", async (_req, res) => {
  res.json({
    success: true,
    module: "super-admin-center",
    mode: "user-management-enabled",
  });
});

router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    select: SAFE_USER_SELECT,
  });

  res.json({ success: true, users });
});

router.post("/users", async (req, res) => {
  const { name, email, phone, password, role = "ADMIN" } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(409).json({
      success: false,
      message: "User already exists with this email.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name || email,
      email,
      phone,
      password: hashedPassword,
      role,
    } as any,
    select: SAFE_USER_SELECT,
  });

  res.json({ success: true, user });
});

router.patch("/users/:id", async (req, res) => {
  const { name, phone, role } = req.body || {};

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(role !== undefined ? { role } : {}),
    } as any,
    select: SAFE_USER_SELECT,
  });

  res.json({ success: true, user });
});

router.patch("/users/:id/reset-password", async (req, res) => {
  const { password } = req.body || {};

  if (!password || String(password).length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: req.params.id },
    data: { password: hashedPassword } as any,
  });

  res.json({ success: true, message: "Password reset successful." });
});

router.delete("/users/:id", async (req, res) => {
  await prisma.user.delete({
    where: { id: req.params.id },
  });

  res.json({ success: true, message: "User deleted." });
});

router.get("/roles", async (_req, res) => {
  const roles = await (prisma as any).role.findMany({ take: 100 });
  res.json({ success: true, roles });
});

router.get("/permissions", async (_req, res) => {
  const permissions = await (prisma as any).permission.findMany({ take: 300 });
  res.json({ success: true, permissions });
});

router.get("/feature-flags", async (_req, res) => {
  const flags = await (prisma as any).featureFlag.findMany({ take: 200 });
  res.json({ success: true, flags });
});

router.get("/provider-control", async (_req, res) => {
  const providers = await (prisma as any).authProvider.findMany({
    include: { settings: true },
  });
  res.json({ success: true, providers });
});

export default router;