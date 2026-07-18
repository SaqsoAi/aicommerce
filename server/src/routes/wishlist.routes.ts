import express from "express";

import {
  addToWishlist,
  getWishlist,
  removeWishlist,
} from "../controllers/wishlist.controller";

const router =
  express.Router();

router.post(
  "/",
  addToWishlist
);

router.get(
  "/:userId",
  getWishlist
);

router.delete(
  "/:id",
  removeWishlist
);

export default router;