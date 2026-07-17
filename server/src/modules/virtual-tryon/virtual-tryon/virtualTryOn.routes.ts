import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import {
  createVirtualTryOn, getMyVirtualTryOnList, getVirtualTryOn, getVirtualTryOnList,
  getVirtualTryOnSettingController, removeMyVirtualTryOn, removeVirtualTryOn,
  retryMyVirtualTryOn, updateVirtualTryOnSettingController,
} from "./virtualTryOn.controller";
import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

const router = Router();
const uploadDir = path.join(process.cwd(), "uploads", "virtual-tryon");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
      const extension = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }[file.mimetype] || ".jpg";
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});

router.get("/health", (_req, res) => res.json({ success: true, module: "virtual-tryon" }));
router.get("/settings", getVirtualTryOnSettingController);
router.put("/settings", protect, permission(PERMISSIONS.AI_ADMIN), updateVirtualTryOnSettingController);
router.post("/person-image", protect, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "A JPEG, PNG, or WebP image is required" });
  const base = `${req.protocol}://${req.get("host")}`;
  return res.status(201).json({ success: true, data: { url: `${base}/uploads/virtual-tryon/${req.file.filename}` } });
});
router.post("/create", protect, createVirtualTryOn);
router.get("/history/me", protect, getMyVirtualTryOnList);
router.get("/history", protect, permission(PERMISSIONS.AI_READ), getVirtualTryOnList);
router.post("/history/:id/retry", protect, retryMyVirtualTryOn);
router.delete("/history/:id", protect, removeMyVirtualTryOn);
router.get("/:id", getVirtualTryOn);
router.delete("/:id", protect, permission(PERMISSIONS.AI_ADMIN), removeVirtualTryOn);
export default router;

