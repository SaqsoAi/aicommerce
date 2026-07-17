import { Router } from "express";

import {
  fetchNotifications,
  fetchNotificationHistory,
  fetchUnreadNotificationCount,
  readNotification,
  readAllNotifications,
} from "./notifications.controller";

const router = Router();

router.get(
  "/",
  fetchNotifications
);

router.get(
  "/history",
  fetchNotificationHistory
);

router.get(
  "/unread-count",
  fetchUnreadNotificationCount
);

router.put(
  "/read/:id",
  readNotification
);

router.put(
  "/read-all",
  readAllNotifications
);

export default router;