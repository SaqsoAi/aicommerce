import { z } from "zod";

export const createSessionSchema = z.object({
  userId: z.string().min(1),
  deviceId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const magicLinkSchema = z.object({
  email: z.string().email(),
  purpose: z.string().default("LOGIN"),
});

export const passwordResetSchema = z.object({
  email: z.string().email(),
});

export const trustedDeviceSchema = z.object({
  userId: z.string().min(1),
  deviceKey: z.string().min(3),
  deviceName: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  ipAddress: z.string().optional(),
});

export const twoFactorSchema = z.object({
  userId: z.string().min(1),
  type: z.string().default("TOTP"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const securityPolicySchema = z.object({
  key: z.string().min(2),
  title: z.string().min(2),
  valueJson: z.unknown().optional(),
  isEnabled: z.boolean().default(true),
});
