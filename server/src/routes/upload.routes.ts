import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { protect } from "../modules/auth/auth.middleware";
import { permission } from "../middleware/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";
import {
  uploadMedia,
  uploadBrandLogo,
  uploadCategoryImage,
} from "../controllers/upload.controller";

const router = express.Router();


// PHASE_12_3E_1B_UPLOAD_MEDIA_PROTECTION
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const productDir = path.join(process.cwd(), "uploads", "products");
const brandDir = path.join(process.cwd(), "uploads", "brands");
const categoryDir = path.join(process.cwd(), "uploads", "categories");

ensureDir(productDir);
ensureDir(brandDir);
ensureDir(categoryDir);

const productStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, productDir),
  filename: (_, file, cb) => {
    cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const brandStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, brandDir),
  filename: (_, file, cb) => cb(null, `brand-${Date.now()}${path.extname(file.originalname)}`),
});

const categoryStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, categoryDir),
  filename: (_, file, cb) => cb(null, `category-${Date.now()}${path.extname(file.originalname)}`),
});

router.post(
  "/product",
  protect,
  permission(PERMISSIONS.MEDIA_UPLOAD),
  multer({ storage: productStorage }).single("file"),
  uploadMedia
);

router.post(
  "/brand",
  protect,
  permission(PERMISSIONS.MEDIA_UPLOAD),
  multer({ storage: brandStorage }).single("file"),
  uploadBrandLogo
);

router.post(
  "/category",
  protect,
  permission(PERMISSIONS.MEDIA_UPLOAD),
  multer({ storage: categoryStorage }).single("file"),
  uploadCategoryImage
);

export default router;
