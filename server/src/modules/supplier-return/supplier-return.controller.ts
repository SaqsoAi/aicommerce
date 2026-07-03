import {
  Request,
  Response,
} from "express";

import {
  createSupplierReturnService,
  getSupplierReturnsService,
} from "./supplier-return.service";

export const createSupplierReturn =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const result =
        await createSupplierReturnService(
          req.body
        );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
    error:
      error instanceof Error
        ? error.message
        : "Unknown error",
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
        await getSupplierReturnsService();

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
    error:
      error instanceof Error
        ? error.message
        : "Unknown error",
  });
}
  };