import { Router } from "express";
import {
  deleteSavedLook,
  mySavedLooks,
  saveLook,
} from "./saved-look.controller";

const router = Router();

router.post(
  "/:lookbookId",
  saveLook
);

router.get(
  "/me",
  mySavedLooks
);

router.delete(
  "/:lookbookId",
  deleteSavedLook
);

export default router;
