import express from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  getCustomerProfileFields,
  createCustomerProfileField,
  updateCustomerProfileField,
  deleteCustomerProfileField,
} from "./customer-profile-builder.controller";

const router = express.Router();

router.get(
  "/",
  protect,
  permission(PERMISSIONS.CUSTOMER_READ),
  getCustomerProfileFields
);

router.post(
  "/",
  protect,
  permission(PERMISSIONS.CUSTOMER_MANAGE),
  createCustomerProfileField
);

router.put(
  "/:id",
  protect,
  permission(PERMISSIONS.CUSTOMER_MANAGE),
  updateCustomerProfileField
);

router.delete(
  "/:id",
  protect,
  permission(PERMISSIONS.CUSTOMER_MANAGE),
  deleteCustomerProfileField
);

export default router;
