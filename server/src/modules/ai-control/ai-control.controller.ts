import { Request, Response } from "express";
import {
  createAiOverride,
  getAiControlDashboard,
  getPublicAiAvailability,
  logAiUsage,
  seedAiControlDefaults,
  updateAiFeature,
  updateAiProvider,
} from "./ai-control.service";

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
    const data = await getPublicAiAvailability();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}