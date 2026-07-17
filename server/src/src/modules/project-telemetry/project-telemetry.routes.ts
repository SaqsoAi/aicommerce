import { Router } from "express";
import { getLatestTelemetry, ingestTelemetry } from "./project-telemetry.controller";
import { authorizeTelemetry } from "./project-telemetry.middleware";

const router = Router();
router.use(authorizeTelemetry);
router.get("/latest", getLatestTelemetry);
router.post("/:kind", ingestTelemetry);

export default router;
