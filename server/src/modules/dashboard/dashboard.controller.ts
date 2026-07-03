import {
  Request,
  Response,
} from "express";

import {
  getDashboardSummary,
} from "./dashboard.service";

export const getDashboard =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getDashboardSummary();

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
      });
    }
  };