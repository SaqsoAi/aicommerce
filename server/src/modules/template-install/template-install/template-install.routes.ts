import { Router } from "express";

import {
  installTemplate,
  uninstallTemplate,
  getInstalledTemplates,
} from "./template-install.controller";

const router = Router();

// 🔄 Install Template
router.post("/install", installTemplate);

// ❌ Uninstall Template
router.post("/uninstall/:id", uninstallTemplate);

// 📦 Get Installed Templates
router.get("/", getInstalledTemplates);

export default router;