import {
  Request,
  Response,
} from "express";

import {
  fetchProductMasterService,
} from "./product-master.service";

export const fetchProductMaster =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        barcode,
        styleCode,
      } = req.body;

      const data =
        await fetchProductMasterService(
          barcode,
          styleCode
        );

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