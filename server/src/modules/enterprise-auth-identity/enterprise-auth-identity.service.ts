import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hash = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const token = () => crypto.randomBytes(32).toString("hex");

export const enterpriseAuthIdentityService = {
  async dashboard() {
    const [
      activeSessions,
      trustedDevices,
      loginEvents,
      twoFactorEnabled,
      securityEvents,
    ] = await Promise.all([
      prisma.authSession.count({ where: { status: "ACTIVE" } }),
      prisma.trustedDevice.count({ where: { isTrusted: true } }),
      prisma.loginHistory.count(),
      prisma.twoFactorCredential.count({ where: { enabled: true } }),
      prisma.securityEvent.count(),
    ]);

    return {
      activeSessions,
      trustedDevices,
      loginEvents,
      twoFactorEnabled,
      securityEvents,
    };
  },

  async listSessions(userId?: string) {
    return prisma.authSession.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
    });
  },

  async createSession(data: any) {
    const rawToken = token();

    const session = await prisma.authSession.create({
      data: {
        userId: data.userId,
        sessionToken: hash(rawToken),
        refreshTokenHash: hash(token()),
        deviceId: data.deviceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    await prisma.securityEvent.create({
      data: {
        userId: data.userId,
        eventType: "SESSION_CREATED",
        severity: "INFO",
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        dataJson: { sessionId: session.id } as any,
      },
    });

    return { session, rawToken };
  },

  async revokeSession(id: string, reason = "MANUAL_REVOKE") {
    return prisma.authSession.update({
      where: { id },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  },

  async forceLogoutUser(userId: string) {
    await prisma.authSession.updateMany({
      where: { userId, status: "ACTIVE" },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
        revokedReason: "FORCE_LOGOUT",
      },
    });

    await prisma.securityEvent.create({
      data: {
        userId,
        eventType: "FORCE_LOGOUT",
        severity: "WARNING",
      },
    });

    return { success: true };
  },

  async listDevices(userId?: string) {
    return prisma.trustedDevice.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { updatedAt: "desc" },
    });
  },

  async trustDevice(data: any) {
    return prisma.trustedDevice.upsert({
      where: { deviceKey: data.deviceKey },
      update: {
        isTrusted: true,
        trustedAt: new Date(),
        lastSeenAt: new Date(),
        deviceName: data.deviceName,
        browser: data.browser,
        os: data.os,
        ipAddress: data.ipAddress,
      },
      create: {
        userId: data.userId,
        deviceKey: data.deviceKey,
        deviceName: data.deviceName,
        browser: data.browser,
        os: data.os,
        ipAddress: data.ipAddress,
        isTrusted: true,
        trustedAt: new Date(),
        lastSeenAt: new Date(),
      },
    });
  },

  async listLoginHistory(userId?: string) {
    return prisma.loginHistory.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  },

  async listTwoFactor(userId?: string) {
    return prisma.twoFactorCredential.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { updatedAt: "desc" },
    });
  },

  async enableTwoFactor(data: any) {
    return prisma.twoFactorCredential.create({
      data: {
        userId: data.userId,
        type: data.type || "TOTP",
        secretHash: data.secret ? hash(data.secret) : undefined,
        phone: data.phone,
        email: data.email,
        enabled: true,
        verifiedAt: new Date(),
      },
    });
  },

  async createMagicLink(data: any) {
    const raw = token();

    const record = await prisma.magicLinkToken.create({
      data: {
        email: data.email,
        tokenHash: hash(raw),
        purpose: data.purpose || "LOGIN",
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    return { id: record.id, token: raw, expiresAt: record.expiresAt };
  },

  async createPasswordReset(data: any) {
    const raw = token();

    const record = await prisma.passwordResetToken.create({
      data: {
        email: data.email,
        tokenHash: hash(raw),
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });

    return { id: record.id, token: raw, expiresAt: record.expiresAt };
  },

  async listPolicies() {
    return prisma.securityPolicy.findMany({
      orderBy: { key: "asc" },
    });
  },

  async upsertPolicy(data: any) {
    return prisma.securityPolicy.upsert({
      where: { key: data.key },
      update: {
        title: data.title,
        valueJson: data.valueJson as any,
        isEnabled: data.isEnabled,
      },
      create: {
        key: data.key,
        title: data.title,
        valueJson: data.valueJson as any,
        isEnabled: data.isEnabled,
      },
    });
  },

  async listSecurityEvents(userId?: string) {
    return prisma.securityEvent.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 300,
    });
  },
};
