import express from "express";

import {
  updateVariantStock,
} from "../controllers/variant.controller";

const router =
  express.Router();

router.put(
  "/:id",
  updateVariantStock
);

export default router;