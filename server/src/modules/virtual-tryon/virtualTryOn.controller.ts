import { Request, Response } from "express";
import {
  createVirtualTryOnJob,
  deleteMyVirtualTryOnJob,
  deleteVirtualTryOnJob,
  getMyVirtualTryOnHistory,
  getVirtualTryOnHistory,
  getVirtualTryOnJobById,
  getVirtualTryOnSettings,
  retryVirtualTryOnJob,
  updateVirtualTryOnSettings,
} from "./virtualTryOn.service";
import { createVirtualTryOnSchema } from "./virtualTryOn.validation";

const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.id || user?.userId || req.body?.userId || "";
};

const getParam = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
};

export const createVirtualTryOn = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = createVirtualTryOnSchema.parse(req.body);
    const job = await createVirtualTryOnJob(payload);

    res.json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Virtual Try-On failed",
    });
  }
};

export const getVirtualTryOn = async (
  req: Request,
  res: Response
) => {
  try {
    const job = await getVirtualTryOnJobById(getParam(req.params.id));

    res.json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Virtual Try-On job not found",
    });
  }
};

export const getVirtualTryOnList = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      typeof req.query.userId === "string"
        ? req.query.userId
        : undefined;

    const jobs = await getVirtualTryOnHistory(userId);

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Virtual Try-On history failed",
    });
  }
};

export const getMyVirtualTryOnList = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const jobs = await getMyVirtualTryOnHistory(userId);

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "My Virtual Try-On history failed",
    });
  }
};

export const removeVirtualTryOn = async (
  req: Request,
  res: Response
) => {
  try {
    await deleteVirtualTryOnJob(getParam(req.params.id));

    res.json({
      success: true,
      message: "Virtual Try-On job deleted",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Virtual Try-On delete failed",
    });
  }
};

export const removeMyVirtualTryOn = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const id = getParam(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await deleteMyVirtualTryOnJob(userId, id);

    res.json({
      success: true,
      message: "Virtual Try-On history deleted",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Virtual Try-On delete failed",
    });
  }
};

export const retryMyVirtualTryOn = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const id = getParam(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await retryVirtualTryOnJob(userId, id);

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Virtual Try-On retry failed",
    });
  }
};

export const getVirtualTryOnSettingController = async (
  _req: Request,
  res: Response
) => {
  const settings = await getVirtualTryOnSettings();

  res.json({
    success: true,
    data: settings,
  });
};

export const updateVirtualTryOnSettingController = async (
  req: Request,
  res: Response
) => {
  const settings = await updateVirtualTryOnSettings({
    sizes: req.body.sizes || [],
  });

  res.json({
    success: true,
    data: settings,
  });
};
