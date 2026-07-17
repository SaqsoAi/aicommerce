import express from "express";

import {
  getTemplates,
  getActiveTemplate,
  activateTemplate,
} from "../controllers/template.controller";

const router =
  express.Router();

router.get(
  "/",
  getTemplates
);

router.get(
  "/active",
  getActiveTemplate
);

router.put(
  "/activate/:slug",
  activateTemplate
);

export default router;