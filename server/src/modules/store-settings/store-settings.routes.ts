import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  getStoreSettings,
  updateStoreSettings,
  uploadStoreLogo,
} from "./store-settings.controller";

const router = Router();

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "store"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(
      null,
      `store-${Date.now()}${ext}`
    );
  },
});

const upload = multer({
  storage,
});

router.get(
  "/",
  protect,
  permission(PERMISSIONS.SETTINGS_READ),
  getStoreSettings
);

router.put(
  "/",
  protect,
  permission(PERMISSIONS.SETTINGS_MANAGE),
  updateStoreSettings
);

router.post(
  "/logo",
  protect,
  permission(PERMISSIONS.MEDIA_UPLOAD),
  upload.single("file"),
  uploadStoreLogo
);

export default router;
