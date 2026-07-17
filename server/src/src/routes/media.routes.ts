import { Router } from "express";
import upload from "../middleware/upload.middleware";
import { uploadMedia } from "../modules/media/media.controller";

import { protect } from "../modules/auth/auth.middleware";
import { permission } from "../middleware/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";
const router = Router();


// PHASE_12_3E_1B_UPLOAD_MEDIA_PROTECTION
router.post(
  "/upload", protect, permission(PERMISSIONS.MEDIA_UPLOAD), upload.single("file"),
  uploadMedia
);

export default router;