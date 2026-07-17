import { Request, Response } from "express";
import {
  getSocialFeedSettingsService,
  updateSocialFeedSettingsService,
} from "./social-feed-settings.service";

export const getSocialFeedSettings = async (_req: Request, res: Response) => {
  const data = await getSocialFeedSettingsService();
  return res.json({ success: true, data });
};

export const updateSocialFeedSettings = async (req: Request, res: Response) => {
  const data = await updateSocialFeedSettingsService(req.body);
  return res.json({ success: true, data });
};
