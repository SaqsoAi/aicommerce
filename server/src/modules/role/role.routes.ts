import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";
import {
  getRolesController,
} from "./role.controller";

const router = Router();

router.get(
  "/",
  protect,
  permission(PERMISSIONS.ROLE_READ),
  getRolesController
);

export default router;