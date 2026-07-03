import { Router } from "express";

import {
  fetchNotificationProviderHealth,
  fetchNotificationProviders,
  saveNotificationProvider,
  sendTestEmailProvider,
  sendTestPushProvider,
} from "./notification-providers.controller";

const router = Router();

router.get("/", fetchNotificationProviders);
router.post("/", saveNotificationProvider);
router.get("/health", fetchNotificationProviderHealth);
router.post("/test-email", sendTestEmailProvider);
router.post("/test-push", sendTestPushProvider);

export default router;
