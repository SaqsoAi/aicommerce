import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  getHeroesController,
  createHeroController,
  updateHeroController,
  deleteHeroController,
  uploadHeroMediaController,
  aiGenerateHeroController,
} from "./homepage-hero.controller";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "public/uploads/homepage-hero");
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const base = path
      .basename(file.originalname, ext)
      .normalize("NFKD")
      .replace(/[^\w-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    const safeBase = base || "homepage-hero";
    const id = crypto.randomUUID();

    cb(null, `${Date.now()}-${id}-${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

router.get("/", getHeroesController);

router.post("/", protect, permission(PERMISSIONS.CONTENT_MANAGE), createHeroController);

router.post("/ai-generate", protect, permission(PERMISSIONS.AI_MANAGE), aiGenerateHeroController);

router.put("/:id", protect, permission(PERMISSIONS.CONTENT_MANAGE), updateHeroController);

router.delete("/:id", protect, permission(PERMISSIONS.CONTENT_MANAGE), deleteHeroController);

router.post(
  "/upload",
  protect,
  permission(PERMISSIONS.MEDIA_UPLOAD),
  upload.single("file"),
  uploadHeroMediaController
);

export default router;
