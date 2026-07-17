import { Request, Response } from "express";

import {
  getNotificationProviderHealth,
  listNotificationProviders,
  queueTestEmail,
  queueTestPush,
  upsertNotificationProvider,
} from "./notification-providers.service";

export const fetchNotificationProviders = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await listNotificationProviders();
    return res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification providers",
    });
  }
};

export const saveNotificationProvider = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await upsertNotificationProvider(req.body);
    return res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to save notification provider",
    });
  }
};

export const fetchNotificationProviderHealth = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await getNotificationProviderHealth();
    return res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider health",
    });
  }
};

export const sendTestEmailProvider = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await queueTestEmail(req.body.to, req.body.message);
    return res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to queue test email",
    });
  }
};

export const sendTestPushProvider = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await queueTestPush(req.body.receiver, req.body.message);
    return res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to queue test push",
    });
  }
};
