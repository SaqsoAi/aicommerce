import { Router } from "express";

import {
  createSupplierReturn,
  getSupplierReturns,
} from "./supplier-return.controller";

const router = Router();

router.get(
  "/",
  getSupplierReturns
);

router.post(
  "/",
  createSupplierReturn
);

export default router;