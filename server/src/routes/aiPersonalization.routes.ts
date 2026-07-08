import { Router } from "express";
import {
  crossSell,
  personalizedHomepage,
  preferences,
  productRanking,
  upsell,
  wishlistPrediction,
} from "../controllers/aiPersonalization.controller";

const router = Router();

router.post("/homepage", personalizedHomepage);
router.post("/ranking", productRanking);
router.post("/wishlist", wishlistPrediction);
router.post("/cross-sell", crossSell);
router.post("/upsell", upsell);
router.post("/preferences", preferences);

export default router;
