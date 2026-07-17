import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();

async function nextSequence(key: string, prefix: string, padLength = 5) {
  const seq = await prisma.enterpriseProductSequence.upsert({
    where: { key },
    update: { nextNumber: { increment: 1 } },
    create: { key, prefix, nextNumber: 2, padLength },
  });

  const current = seq.nextNumber - 1;
  return `${seq.prefix}${String(current).padStart(seq.padLength, "0")}`;
}

router.get("/next-style-no", async (_req, res) => {
  const styleNo = await nextSequence("product_style_no", "IS-", 5);
  res.json({ success: true, styleNo });
});

router.get("/next-barcode", async (_req, res) => {
  const barcode = await nextSequence("product_barcode", "A", 5);
  res.json({ success: true, barcode });
});

router.post("/generate-variant-barcodes", async (req, res) => {
  const { colors = [], sizes = [] } = req.body || {};
  const variants: any[] = [];

  for (const color of colors) {
    for (const size of sizes) {
      const barcode = await nextSequence("product_barcode", "A", 5);
      variants.push({ color, size, barcode });
    }
  }

  res.json({ success: true, variants });
});

export default router;