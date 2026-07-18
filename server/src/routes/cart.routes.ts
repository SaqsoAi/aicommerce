import express from "express";

import {
  addToCart,
  getCartItems,
} from "../controllers/cart.controller";

const router = express.Router();

router.post("/", addToCart);

router.get("/", getCartItems);

export default router;