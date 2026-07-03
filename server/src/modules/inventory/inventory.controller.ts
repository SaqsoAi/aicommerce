import {
  Request,
  Response,
} from "express";

import {
  getInventoryService,
  getLowStockService,
  getOutOfStockService,
  getInventoryHistoryService,
} from "./inventory.service";

export const getInventory =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const inventory =
        await getInventoryService();

      return res.json({
        success: true,
        data: inventory,
      });
    } catch {
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
    } catch {
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
    } catch {
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
      const history =
        await getInventoryHistoryService();

      return res.json({
        success: true,
        data: history,
      });
    } catch {
      return res.status(500).json({
        success: false,
      });
    }
  };