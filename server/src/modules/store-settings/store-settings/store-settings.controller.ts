import type { Request, Response } from "express";
import {
  getStoreSettingsService,
  updateStoreSettingsService,
  type StoreSettingsScope,
} from "./store-settings.service";
import { storeSettingsSchema } from "./store-settings.validation";

function scopeFromRequest(req: Request): StoreSettingsScope {
  const tenantId = String(req.user?.tenantId || "").trim();
  const storeId = String(req.user?.storeId || "").trim();

  if (!tenantId || !storeId) {
    throw Object.assign(
      new Error("Authenticated tenant and store context are required"),
      { statusCode: 403 },
    );
  }

  return { tenantId, storeId };
}

function fail(res: Response, error: unknown, fallback: number) {
  const item = error as { message?: string; statusCode?: number };

  return res.status(item.statusCode || fallback).json({
    success: false,
    message: item.message || "Store settings operation failed",
  });
}

export async function getStoreSettings(req: Request, res: Response) {
  try {
    const data = await getStoreSettingsService(scopeFromRequest(req));
    return res.json({ success: true, data });
  } catch (error) {
    return fail(res, error, 500);
  }
}

export async function updateStoreSettings(req: Request, res: Response) {
  try {
    const body = storeSettingsSchema.parse(req.body);
    const data = await updateStoreSettingsService(
      scopeFromRequest(req),
      body,
    );

    return res.json({ success: true, data });
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function uploadStoreLogo(req: Request, res: Response) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const baseUrl =
      process.env.SERVER_URL ||
      `${req.protocol}://${req.get("host")}`;

    const logoUrl = `${baseUrl}/uploads/store/${file.filename}`;
    const data = await updateStoreSettingsService(
      scopeFromRequest(req),
      { logoUrl },
    );

    return res.json({
      success: true,
      data,
      logoUrl,
    });
  } catch (error) {
    return fail(res, error, 500);
  }
}
