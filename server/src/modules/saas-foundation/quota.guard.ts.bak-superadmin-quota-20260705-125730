import { NextFunction, Response } from "express";
import prisma from "../../config/prisma";

type QuotaMetric =
  | "products"
  | "orders"
  | "customers"
  | "storageMb"
  | "aiTokens"
  | "staff";

function getTenantId(req: any): string {
  return (
    req.headers["x-tenant-id"] ||
    req.user?.tenantId ||
    req.user?.storeId ||
    req.body?.tenantId ||
    req.query?.tenantId ||
    "default"
  ).toString();
}

async function getActiveSubscription(tenantId: string) {
  return prisma.tenantSubscription.findFirst({
    where: {
      tenantId,
      status: {
        in: ["ACTIVE", "TRIAL"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getPlanLimit(planKey: string, metric: QuotaMetric): Promise<number> {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { key: planKey },
    select: { limits: true },
  });

  const limits = plan?.limits as Record<string, unknown> | null;
  const value = Number(limits?.[metric] || 0);

  return Number.isFinite(value) ? value : 0;
}

async function getQuotaOverride(tenantId: string, metric: QuotaMetric): Promise<number | null> {
  const quota = await prisma.tenantQuota.findUnique({
    where: {
      tenantId_key: {
        tenantId,
        key: metric,
      },
    },
  });

  if (!quota || !quota.enabled) return null;

  return Number(quota.limit || 0);
}

async function getCurrentUsage(tenantId: string, metric: QuotaMetric): Promise<number> {
  if (metric === "products") {
    return prisma.product.count();
  }

  if (metric === "orders") {
    return prisma.order.count();
  }

  if (metric === "customers") {
    return prisma.user.count();
  }

  if (metric === "aiTokens") {
    const usage = await prisma.aiUsageLog.aggregate({
      _sum: {
        totalTokens: true,
      },
    }).catch(() => ({ _sum: { totalTokens: 0 } }));

    return Number(usage._sum.totalTokens || 0);
  }

  if (metric === "storageMb") {
    return 0;
  }

  if (metric === "staff") {
    return prisma.user.count({
      where: {
        role: {
          in: ["ADMIN", "MANAGER", "STAFF"] as any,
        },
      },
    }).catch(() => 0);
  }

  return 0;
}

export async function evaluateTenantQuota(
  tenantId: string,
  metric: QuotaMetric,
  increment = 1,
) {
  const subscription = await getActiveSubscription(tenantId);

  if (!subscription) {
    return {
      allowed: false,
      tenantId,
      metric,
      used: 0,
      limit: 0,
      remaining: 0,
      reason: "NO_ACTIVE_SUBSCRIPTION",
    };
  }

  const overrideLimit = await getQuotaOverride(tenantId, metric);
  const planLimit = await getPlanLimit(subscription.planKey, metric);
  const limit = overrideLimit ?? planLimit;

  if (limit === 0) {
    return {
      allowed: true,
      tenantId,
      metric,
      used: 0,
      limit,
      remaining: 0,
      reason: "UNLIMITED",
    };
  }

  const used = await getCurrentUsage(tenantId, metric);
  const remaining = Math.max(limit - used, 0);
  const allowed = used + increment <= limit;

  return {
    allowed,
    tenantId,
    metric,
    used,
    limit,
    remaining,
    reason: allowed ? "OK" : "QUOTA_EXCEEDED",
  };
}

export function quotaGuard(metric: QuotaMetric, increment = 1) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const result = await evaluateTenantQuota(tenantId, metric, increment);

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          message: `${metric} quota exceeded`,
          quota: result,
        });
      }

      req.quota = result;
      return next();
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Quota guard failed",
      });
    }
  };
}