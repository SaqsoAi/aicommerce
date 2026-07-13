import { Router } from "express";
import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";
import {
  getHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  reorderHomepageSectionsController,
  toggleHomepageSectionController,
} from "./homepage-section.controller";

const router = Router();

router.get(
  "/",
  protect,
  permission(PERMISSIONS.CONTENT_MANAGE),
  getHomepageSections,
);

router.post(
  "/",
  protect,
  permission(PERMISSIONS.CONTENT_MANAGE),
  createHomepageSection,
);

router.patch(
  "/reorder",
  protect,
  permission(PERMISSIONS.CONTENT_MANAGE),
  reorderHomepageSectionsController,
);

router.patch(
  "/:id/toggle",
  protect,
  permission(PERMISSIONS.CONTENT_MANAGE),
  toggleHomepageSectionController,
);

router.put(
  "/:id",
  protect,
  permission(PERMISSIONS.CONTENT_MANAGE),
  updateHomepageSection,
);

router.delete(
  "/:id",
  protect,
  permission(PERMISSIONS.CONTENT_MANAGE),
  deleteHomepageSection,
);

export default router;
