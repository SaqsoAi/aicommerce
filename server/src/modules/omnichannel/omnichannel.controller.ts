import { Request, Response } from "express";
import {
  createOmnichannelRoute,
  getOmnichannelAnalytics,
  getOmnichannelHealth,
  getUnifiedTimeline,
} from "./omnichannel.service";

const userId = (req: Request) =>
  (req as any).user?.id || (req as any).userId || req.query.userId?.toString();

export const health = async (_req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: await getOmnichannelHealth() });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch omnichannel health" });
  }
};

export const timeline = async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: await getUnifiedTimeline(userId(req)) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch timeline" });
  }
};

export const routeMessage = async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: await createOmnichannelRoute(req.body) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to route omnichannel message" });
  }
};

export const analytics = async (_req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: await getOmnichannelAnalytics() });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch omnichannel analytics" });
  }
};
