import { Router } from "express";
import { sizeFitCenterController } from "./size-fit-center.controller";

const router = Router();

router.get("/", sizeFitCenterController.getSettings);
router.put("/", sizeFitCenterController.updateSettings);

router.get("/reviews", sizeFitCenterController.getReviews);
router.post("/reviews", sizeFitCenterController.submitReview);

router.patch("/reviews/:id/approve", sizeFitCenterController.approveReview);
router.patch("/reviews/:id/feature", sizeFitCenterController.featureReview);

export default router;
