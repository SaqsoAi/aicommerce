import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";

import { protect } from "../modules/auth/auth.middleware";
import { permission } from "../middleware/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = Router();

const root = process.cwd();
const uploadRoot = path.join(root, "uploads", "branding");

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const type = String(req.query.type || req.body?.type || "brand")
      .replace(/[^a-z0-9-_]/gi, "")
      .toLowerCase();
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    cb(null, `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
  },
});

const allowed = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      cb(new Error("Only PNG, JPG, JPEG, WEBP, SVG, AVIF and ICO images are allowed"));
      return;
    }
    cb(null, true);
  },
});

function uploadHandler(req: Request, res: Response) {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const url = `/uploads/branding/${file.filename}`;

  return res.json({
    success: true,
    url,
    path: url,
    data: {
      url,
      path: url,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      type: req.query.type || req.body?.type || "brand",
    },
  });
}

router.get("/", (_req, res) => {
  res.json({
    success: true,
    module: "branding-upload",
    message: "Use POST with multipart/form-data field name file",
  });
});

router.post("/", protect, permission(PERMISSIONS.MEDIA_UPLOAD), upload.single("file"), uploadHandler);
router.post("/branding-upload", protect, permission(PERMISSIONS.MEDIA_UPLOAD), upload.single("file"), uploadHandler);

export default router;