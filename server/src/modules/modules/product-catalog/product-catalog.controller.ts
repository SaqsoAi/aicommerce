import { Request, Response } from "express";
import { productCatalogService } from "./product-catalog.service";

export const productCatalogController = {
  async filters(_req: Request, res: Response) {
    const data = await productCatalogService.getFilters();
    return res.json({ success: true, data });
  },

  async products(req: Request, res: Response) {
    const data = await productCatalogService.getProducts(req.query);
    return res.json({ success: true, data });
  },

  async stylistPicks(_req: Request, res: Response) {
    const data = await productCatalogService.getStylistPicks();
    return res.json({ success: true, data });
  },

  async recommended(_req: Request, res: Response) {
    const data = await productCatalogService.getRecommended();
    return res.json({ success: true, data });
  },
};