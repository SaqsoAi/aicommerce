import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { protect } from "../modules/auth/auth.middleware";
import { permission } from "../middleware/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";
import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "../controllers/brand.controller";

const router = express.Router();


// PHASE_12_3E_1B_UPLOAD_MEDIA_PROTECTION
const uploadDir = path.join(process.cwd(), "public", "uploads", "brands");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `brand-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.get("/", getBrands);
router.get("/:id", getBrandById);
router.post("/", protect, permission(PERMISSIONS.CATALOG_MANAGE), createBrand);
router.put("/:id", protect, permission(PERMISSIONS.CATALOG_MANAGE), updateBrand);
router.delete("/:id", protect, permission(PERMISSIONS.CATALOG_MANAGE), deleteBrand);

router.post("/logo/upload", protect, permission(PERMISSIONS.MEDIA_UPLOAD), upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  return res.json({
    success: true,
    data: {
      url: `/uploads/brands/${req.file.filename}`,
    },
  });
});

export default router;
