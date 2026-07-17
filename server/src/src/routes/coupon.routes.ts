import express from "express";

import {
  applyCoupon,
} from "../controllers/coupon.controller";

const router = express.Router();

router.post("/apply", applyCoupon);

export default router;