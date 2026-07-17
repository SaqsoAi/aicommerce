import { Request, Response } from "express";
import {
  getPublicFeatureFlags,
  getTenantUsage,
  listFeatureFlags,
  listPlans,
  seedSaasFoundation,
  updateFeatureFlag,
  updatePlan,
  updateTenantQuota,
} from "./saas-foundation.service";
import { evaluateTenantQuota } from "./quota.guard";

export async function seedSaasFoundationHandler(_req: Request, res: Response) {
  try {
    const data = await seedSaasFoundation();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function listFeatureFlagsHandler(_req: Request, res: Response) {
  try {
    const data = await listFeatureFlags();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateFeatureFlagHandler(req: Request, res: Response) {
  try {
    const data = await updateFeatureFlag(req.body || {});
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function listPlansHandler(_req: Request, res: Response) {
  try {
    const data = await listPlans();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updatePlanHandler(req: Request, res: Response) {
  try {
    const data = await updatePlan(req.body || {});
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getTenantUsageHandler(req: Request, res: Response) {
  try {
    const data = await getTenantUsage(String(req.params.tenantId || "default"));
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateTenantQuotaHandler(req: Request, res: Response) {
  try {
    const data = await updateTenantQuota(req.body || {});
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getPublicFeatureFlagsHandler(_req: Request, res: Response) {
  try {
    const data = await getPublicFeatureFlags();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}
export async function evaluateTenantQuotaHandler(req: Request, res: Response) {
  try {
    const tenantId = String(req.params.tenantId || req.query.tenantId || "default");
    const metric = String(req.params.metric || req.query.metric || "products") as any;
    const increment = Number(req.query.increment || 1);

    const data = await evaluateTenantQuota(tenantId, metric, increment);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}