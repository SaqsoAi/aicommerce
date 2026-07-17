import { Request, Response } from "express";
import {
  getCustomerActivityTimeline,
  getCustomerIntelligenceProfile,
  getCustomerPreferences,
  getCustomerRecommendationHistory,
  refreshCustomerStyleProfile,
  upsertCustomerPreference,
} from "./customer-intelligence.service";

const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.id || user?.userId || req.query.userId?.toString() || req.body?.userId || "";
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getCustomerIntelligenceProfile(userId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Customer intelligence failed",
    });
  }
};

export const getActivity = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getCustomerActivityTimeline(userId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Customer activity failed",
    });
  }
};

export const getPreferences = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getCustomerPreferences(userId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Customer preferences failed",
    });
  }
};

export const savePreference = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await upsertCustomerPreference(userId, {
      key: String(req.body.key || ""),
      value: String(req.body.value || ""),
      weight: Number(req.body.weight || 1),
      source: req.body.source || "CUSTOMER",
    });

    await refreshCustomerStyleProfile(userId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Preference save failed",
    });
  }
};

export const refreshStyle = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await refreshCustomerStyleProfile(userId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Style profile refresh failed",
    });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getCustomerRecommendationHistory(userId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Recommendation history failed",
    });
  }
};
