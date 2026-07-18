import { Request, Response } from "express";
import {
  getSettingsV2Service,
  seedSettingsV2Service,
  updateSettingsV2Service,
} from "./settings-v2.service";

export const getSettingsV2Controller = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await getSettingsV2Service();

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const seedSettingsV2Controller = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await seedSettingsV2Service();

    res.json({
      success: true,
      message: "Settings seeded",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSettingsV2Controller = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await updateSettingsV2Service(
      req.body || {},
      req.headers["x-user-id"] as string | undefined
    );

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
