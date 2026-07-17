import { Router } from "express";
import {
  createLookbook,
  deleteLookbook,
  getLookbook,
  listLookbooks,
  listPublishedLookbooks,
  publishLookbook,
  updateLookbook,
} from "./lookbook.controller";
import { requirePermission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

const router = Router();

router.get(
  "/public",
  listPublishedLookbooks
);

router.get(
  "/",
  requirePermission(PERMISSIONS.LOOKBOOK_READ),
  listLookbooks
);

router.get(
  "/:slug",
  getLookbook
);

router.post(
  "/",
  requirePermission(PERMISSIONS.LOOKBOOK_MANAGE),
  createLookbook
);

router.put(
  "/:id",
  requirePermission(PERMISSIONS.LOOKBOOK_MANAGE),
  updateLookbook
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.LOOKBOOK_MANAGE),
  deleteLookbook
);

router.patch(
  "/:id/publish",
  requirePermission(PERMISSIONS.LOOKBOOK_MANAGE),
  publishLookbook
);

export default router;
