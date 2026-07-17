import { Router } from "express";
import { analytics, health, routeMessage, timeline } from "./omnichannel.controller";

const router = Router();

router.get("/health", health);
router.get("/timeline", timeline);
router.get("/analytics", analytics);
router.post("/route", routeMessage);

export default router;
