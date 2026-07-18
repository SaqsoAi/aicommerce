import { Request, Response } from "express";
import {
  createAiOverride,
  getAiControlDashboard,
  getAiSecretGovernance,
  getPublicAiAvailability,
  logAiUsage,
  seedAiControlDefaults,
  updateAiFeature,
  updateAiProvider,
} from "./ai-control.service";
import { getAiPlatformRegistry, saveAiEnterpriseSetting, saveAiModel, saveAiPolicy, saveAiPrompt } from "./ai-control-platform.service";

function actor(req: Request): string | undefined {
  return String((req as any).user?.id ?? (req as any).user?.userId ?? "").trim() || undefined;
}

export async function getAiPlatformRegistryHandler(_req: Request, res: Response) {
  try { return res.json({ success: true, data: await getAiPlatformRegistry() }); }
  catch (error: any) { return res.status(400).json({ success: false, message: error.message }); }
}
export async function saveAiPromptHandler(req: Request, res: Response) {
  try { return res.json({ success: true, data: await saveAiPrompt(req.body || {}, actor(req)) }); }
  catch (error: any) { return res.status(400).json({ success: false, message: error.message }); }
}
export async function saveAiModelHandler(req: Request, res: Response) {
  try { return res.json({ success: true, data: await saveAiModel(req.body || {}) }); }
  catch (error: any) { return res.status(400).json({ success: false, message: error.message }); }
}
export async function saveAiPolicyHandler(req: Request, res: Response) {
  try { return res.json({ success: true, data: await saveAiPolicy(param(req.params.key), req.body || {}, actor(req)) }); }
  catch (error: any) { return res.status(400).json({ success: false, message: error.message }); }
}
export async function saveAiEnterpriseSettingHandler(req: Request, res: Response) {
  try { return res.json({ success: true, data: await saveAiEnterpriseSetting(param(req.params.key), req.body || {}, actor(req)) }); }
  catch (error: any) { return res.status(400).json({ success: false, message: error.message }); }
}

export async function getAiSecretGovernanceHandler(_req: Request, res: Response) {
  return res.json({ success: true, data: getAiSecretGovernance() });
}

function param(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
}

export async function seedAiControlHandler(req: Request, res: Response) {
  try {
    const data = await seedAiControlDefaults();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAiControlDashboardHandler(req: Request, res: Response) {
  try {
    const data = await getAiControlDashboard();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateAiFeatureHandler(req: Request, res: Response) {
  try {
    const data = await updateAiFeature(param(req.params.key), req.body || {});
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateAiProviderHandler(req: Request, res: Response) {
  try {
    const data = await updateAiProvider(param(req.params.key), req.body || {});
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function logAiUsageHandler(req: Request, res: Response) {
  try {
    const data = await logAiUsage(req.body || {});
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function createAiOverrideHandler(req: Request, res: Response) {
  try {
    const data = await createAiOverride(req.body || {});
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getPublicAiAvailabilityHandler(req: Request, res: Response) {
  try {
    const tenantId = String(req.query.tenantId ?? req.header("x-tenant-id") ?? "").trim() || undefined;
    const storeId = String(req.query.storeId ?? req.header("x-store-id") ?? "").trim() || undefined;
    const data = await getPublicAiAvailability({ tenantId, storeId });
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}
