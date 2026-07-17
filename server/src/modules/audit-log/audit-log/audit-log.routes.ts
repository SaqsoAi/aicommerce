import { Router } from "express";

import {
  fetchAuditLogs,
} from "./audit-log.controller";

const router = Router();

router.get(
  "/",
  fetchAuditLogs
);

export default router;
