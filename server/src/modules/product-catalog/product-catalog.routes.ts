import { Router } from "express";
import { productCatalogController } from "./product-catalog.controller";

const router = Router();

router.get("/filters", productCatalogController.filters);
router.get("/products", productCatalogController.products);
router.get("/stylist-picks", productCatalogController.stylistPicks);
router.get("/recommended", productCatalogController.recommended);

export default router;