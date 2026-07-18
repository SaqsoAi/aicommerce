import { Router } from "express";
import { heroEnterprisePersistenceController } from "./hero-enterprise-persistence.controller";

const router = Router();

router.post("/:heroId/drafts", heroEnterprisePersistenceController.saveDraft);
router.get("/:heroId/drafts", heroEnterprisePersistenceController.listDrafts);

router.post("/:heroId/versions", heroEnterprisePersistenceController.createVersion);
router.get("/:heroId/versions", heroEnterprisePersistenceController.listVersions);
router.post("/:heroId/versions/:versionId/restore", heroEnterprisePersistenceController.restoreVersion);

router.post("/analytics", heroEnterprisePersistenceController.trackAnalytics);

router.get("/:heroId/variants", heroEnterprisePersistenceController.listVariants);
router.post("/:heroId/variants", heroEnterprisePersistenceController.upsertVariant);

export default router;