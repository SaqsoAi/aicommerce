import { Request, Response } from "express";
import {
  activateTenantSubscription,
  cancelTenantSubscription,
  changeTenantPlan,
  getSubscriptionReadiness,
  getTenantSubscription,
  listTenantSubscriptions,
  startTenantTrial,
  suspendTenantSubscription,
} from "./subscription-engine.service";

export async function listTenantSubscriptionsHandler(_req: Request, res: Response) {
  try {
    const data = await listTenantSubscriptions();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getTenantSubscriptionHandler(req: Request, res: Response) {
  try {
    const data = await getTenantSubscription(String(req.params.tenantId || ""));
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function startTenantTrialHandler(req: Request, res: Response) {
  try {
    const data = await startTenantTrial(req.body || {});
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function activateTenantSubscriptionHandler(req: Request, res: Response) {
  try {
    const data = await activateTenantSubscription(req.body || {});
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function changeTenantPlanHandler(req: Request, res: Response) {
  try {
    const data = await changeTenantPlan(req.body || {});
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function cancelTenantSubscriptionHandler(req: Request, res: Response) {
  try {
    const data = await cancelTenantSubscription(req.body || {});
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function suspendTenantSubscriptionHandler(req: Request, res: Response) {
  try {
    const data = await suspendTenantSubscription(req.body || {});
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getSubscriptionReadinessHandler(_req: Request, res: Response) {
  try {
    const data = await getSubscriptionReadiness();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}