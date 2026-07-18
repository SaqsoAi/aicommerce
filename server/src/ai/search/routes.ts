import { Router } from "express";
import { aiSearchController } from "./controller";

const router = Router();

router.post("/semantic", aiSearchController.semantic);
router.post("/similar", aiSearchController.similar);
router.post("/image-foundation", aiSearchController.imageFoundation);
router.post("/ocr-foundation", aiSearchController.ocrFoundation);
router.post("/voice-foundation", aiSearchController.voiceFoundation);

export default router;
