import {
  Request,
  Response,
} from "express";

import {
  getAuditLogs,
} from "./audit-log.service";

export const fetchAuditLogs =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getAuditLogs();

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
