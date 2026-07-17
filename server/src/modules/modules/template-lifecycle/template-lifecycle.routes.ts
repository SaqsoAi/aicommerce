import { Router } from "express";

import {
  activateTemplate,
  deactivateTemplate,
  rollbackTemplate,
} from "./template-lifecycle.controller";

const router = Router();

// 🚀 ACTIVATE TEMPLATE
router.post("/activate/:id", activateTemplate);

// ❌ DEACTIVATE TEMPLATE
router.post("/deactivate/:id", deactivateTemplate);

// 🔄 ROLLBACK TEMPLATE
router.post("/rollback/:id", rollbackTemplate);

export default router;