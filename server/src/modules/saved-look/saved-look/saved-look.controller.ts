import { Request, Response } from "express";
import { saveLookSchema } from "./saved-look.validation";
import * as savedLookService from "./saved-look.service";

const getUserId = (req: Request): string => {
  const user = (req as any).user;

  return user?.id || user?.userId || "";
};

const getParam = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
};

export const saveLook = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const lookbookId = getParam(req.params.lookbookId);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!lookbookId) {
    return res.status(400).json({
      success: false,
      message: "Lookbook id is required",
    });
  }

  const payload = saveLookSchema.parse(req.body);
  const data = await savedLookService.saveLook(userId, lookbookId, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const mySavedLooks = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const data = await savedLookService.getMySavedLooks(userId);

  res.json({
    success: true,
    data,
  });
};

export const deleteSavedLook = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const lookbookId = getParam(req.params.lookbookId);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!lookbookId) {
    return res.status(400).json({
      success: false,
      message: "Lookbook id is required",
    });
  }

  await savedLookService.removeSavedLook(userId, lookbookId);

  res.json({
    success: true,
    message: "Saved look removed",
  });
};
