-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "availableStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "reservedStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "supplierSku" TEXT,
ADD COLUMN     "warehouseLocation" TEXT;
