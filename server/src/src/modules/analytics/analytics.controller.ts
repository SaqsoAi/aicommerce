import type { Request, Response } from "express";

import {
  getAnalytics,
  getSalesForecast,
  getSavedLooksAnalytics,
  getVirtualTryOnAnalytics,
} from "./analytics.service";

export const fetchAnalytics = async (
  req: Request,
  res: Response
) => {
  const data = await getAnalytics();

  return res.json({
    success: true,
    data,
  });
};

export const fetchSalesForecast = async (
  req: Request,
  res: Response
) => {
  const data = await getSalesForecast();

  return res.json({
    success: true,
    data,
  });
};

export const fetchSavedLooksAnalytics = async (
  req: Request,
  res: Response
) => {
  const data = await getSavedLooksAnalytics();

  return res.json({
    success: true,
    data,
  });
};

export const fetchVirtualTryOnAnalytics = async (
  req: Request,
  res: Response
) => {
  const data = await getVirtualTryOnAnalytics();

  return res.json({
    success: true,
    data,
  });
};
