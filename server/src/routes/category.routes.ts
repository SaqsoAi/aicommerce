import express from "express";

import { protect } from "../modules/auth/auth.middleware";
import { permission } from "../middleware/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createSubcategory,
  getSubcategories,
  getSubcategoriesByCategory,
  deleteSubcategory,
} from "../controllers/category.controller";

const router = express.Router();

// CATEGORY

router.get("/", getCategories);

router.post(
  "/",
  protect,
  permission(PERMISSIONS.CATALOG_MANAGE),
  createCategory
);

router.put(
  "/:id",
  protect,
  permission(PERMISSIONS.CATALOG_MANAGE),
  updateCategory
);

router.delete(
  "/:id",
  protect,
  permission(PERMISSIONS.CATALOG_MANAGE),
  deleteCategory
);

// SUBCATEGORY

router.get("/subcategories", getSubcategories);

router.post(
  "/subcategory",
  protect,
  permission(PERMISSIONS.CATALOG_MANAGE),
  createSubcategory
);

router.get("/subcategories/category/:categoryId", getSubcategoriesByCategory);

router.delete(
  "/subcategory/:id",
  protect,
  permission(PERMISSIONS.CATALOG_MANAGE),
  deleteSubcategory
);

export default router;
