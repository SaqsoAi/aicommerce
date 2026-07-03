import express from "express";

import { getSubcategoriesByCategory } from "../controllers/category.controller";

import {
  getSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/subcategory.controller";

const router = express.Router();

router.get("/", getSubcategories);
router.post("/", createSubcategory);

router.get("/category/:categoryId", getSubcategoriesByCategory);

router.get("/:id", getSubcategoryById);
router.put("/:id", updateSubcategory);
router.delete("/:id", deleteSubcategory);

export default router;
