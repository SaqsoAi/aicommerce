import { Router } from "express";
import prisma from "../config/prisma";

const router = Router();

const STYLE_PREFIX = "IS";
const BARCODE_PREFIX = "A";
const STYLE_WIDTH = 4;
const BARCODE_WIDTH = 5;

const numberFromCode = (value: unknown, prefix: string) => {
  const text = String(value || "").toUpperCase().replace(/-/g, "");
  if (!text.startsWith(prefix)) return 0;
  const digits = text.replace(prefix, "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
};

const formatCode = (prefix: string, value: number, width: number) =>
  `${prefix}${String(value).padStart(width, "0")}`;

router.get("/next", async (_req, res) => {
  const products = await prisma.product.findMany({
    select: {
      styleNo: true,
      barcode: true,
      variants: {
        select: { barcode: true },
      },
    },
  });

  const lastStyleNumber = Math.max(
    0,
    ...products.map((item) => numberFromCode(item.styleNo, STYLE_PREFIX))
  );

  const allBarcodes = products.flatMap((item) => [
    item.barcode,
    ...item.variants.map((variant) => variant.barcode),
  ]);

  const lastBarcodeNumber = Math.max(
    0,
    ...allBarcodes.map((item) => numberFromCode(item, BARCODE_PREFIX))
  );

  res.json({
    success: true,
    data: {
      lastStyleNo: lastStyleNumber
        ? formatCode(STYLE_PREFIX, lastStyleNumber, STYLE_WIDTH)
        : null,
      nextStyleNo: formatCode(STYLE_PREFIX, lastStyleNumber + 1, STYLE_WIDTH),
      lastBarcode: lastBarcodeNumber
        ? formatCode(BARCODE_PREFIX, lastBarcodeNumber, BARCODE_WIDTH)
        : null,
      nextBarcode: formatCode(BARCODE_PREFIX, lastBarcodeNumber + 1, BARCODE_WIDTH),
    },
  });
});

export default router;
