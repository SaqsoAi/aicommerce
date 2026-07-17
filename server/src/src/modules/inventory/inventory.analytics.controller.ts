import {
  Request,
  Response,
} from "express";

import {
  getInventoryAnalyticsService,
} from "./inventory.analytics.service";

export const getInventoryAnalytics =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getInventoryAnalyticsService();

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
      });
    }
  };