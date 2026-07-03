import {
  Request,
  Response,
} from "express";

import {
  getInventoryStatsService,
  getInventoryAnalyticsService,
  getInventoryHistoryService,
  getLowStockService,
  getOutOfStockService,
  getSupplierReturnsWidgetService,
  getInventoryForecastService,
} from "./inventory-dashboard.service";

export const getInventoryStats =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getInventoryStatsService();

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
      console.error(error);

      return res.status(500).json({
        success: false,
      });
    }
  };

export const getInventoryHistory =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getInventoryHistoryService();

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

export const getLowStock =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getLowStockService();

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

export const getOutOfStock =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getOutOfStockService();

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

export const getSupplierReturns =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getSupplierReturnsWidgetService();

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

export const getInventoryForecast =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getInventoryForecastService();

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Inventory forecast failed",
      });
    }
  };
