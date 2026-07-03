import { Router } from "express";
import { landingController } from "./landing.controller";

const router = Router();

router.get("/", landingController.list);
router.post("/", landingController.create);

router.get("/slug/:slug", landingController.getBySlug);

router.get("/:id", landingController.getById);
router.put("/:id", landingController.update);
router.delete("/:id", landingController.remove);

router.post("/:id/publish", landingController.publish);
router.post("/:id/unpublish", landingController.unpublish);

export default router;
