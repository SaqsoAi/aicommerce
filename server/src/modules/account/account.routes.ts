import express from "express";

import {
  protect,
} from "../auth/auth.middleware";

import {
  getProfile,
  updateProfile,
  getMyOrders,
  getMyWishlist,
} from "./account.controller";

const router =
  express.Router();

router.get(
  "/profile",
  protect,
  getProfile
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.get(
  "/orders",
  protect,
  getMyOrders
);

router.get(
  "/wishlist",
  protect,
  getMyWishlist
);

export default router;