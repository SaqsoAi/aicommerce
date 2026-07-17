import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";
import {
  getPermissionsController,
} from "./permission.controller";

const router = Router();

router.get(
  "/",
  protect,
  permission(PERMISSIONS.ROLE_READ),
  getPermissionsController
);

export default router;