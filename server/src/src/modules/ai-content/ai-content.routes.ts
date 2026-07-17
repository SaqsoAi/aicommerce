import { Router } from "express";

const router = Router();

const generate = async (req: any, res: any) => {
  try {
    const name =
      req.body?.name ||
      req.body?.productName ||
      "Product";

    return res.json({
      success: true,
      data: {
        shortDescription: `Premium ${name}`,
        description: `Premium quality ${name} designed for everyday use, comfort, style and durability.`,
        seoTitle: `${name} | Buy Online`,
        seoKeywords: `${name}, premium ${name}, ecommerce, fashion`,
        seoDescription: `Buy ${name} online at best price with premium quality.`,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "AI content generation failed",
    });
  }
};

router.post("/generate", generate);
router.post("/product-description", generate);

export default router;
