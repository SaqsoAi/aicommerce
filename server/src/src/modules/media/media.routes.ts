import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";
import { quotaGuard } from "../saas-foundation/quota.guard";

import {
  fetchMedia,
  uploadMedia,
  fetchProductImages,
  createImage,
  updateThumbnail,
  reorderProductImages,
  removeProductImage,
} from "./media.controller";

const router = Router();

router.get(
  "/",
  protect,
  permission(PERMISSIONS.MEDIA_READ),
  fetchMedia
);

router.get(
  "/product/:productId",
  fetchProductImages
);

router.post(
  "/product/:productId",
  protect,
  permission(PERMISSIONS.MEDIA_MANAGE),
  createImage
);

router.patch(
  "/product/:imageId/thumbnail",
  protect,
  permission(PERMISSIONS.MEDIA_MANAGE),
  updateThumbnail
);

router.patch(
  "/product/reorder",
  protect,
  permission(PERMISSIONS.MEDIA_MANAGE),
  reorderProductImages
);

router.delete(
  "/product/:imageId",
  protect,
  permission(PERMISSIONS.MEDIA_MANAGE),
  removeProductImage
);

router.post(
  "/upload",
  protect,
  permission(PERMISSIONS.MEDIA_UPLOAD),
  quotaGuard("storageMb"),
  uploadMedia
);

export default router;
