import {
  Request,
  Response,
} from "express";

import {
  globalSearch,
} from "./search.service";

export const search =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const query =
        String(
          req.query.q || ""
        );

      const data =
        await globalSearch(
          query
        );

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