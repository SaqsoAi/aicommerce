/*
  Warnings:

  - You are about to drop the column `banner` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `buyQuantity` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `couponCode` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `getQuantity` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Campaign` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Campaign_slug_key";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "banner",
DROP COLUMN "buyQuantity",
DROP COLUMN "couponCode",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "discountType",
DROP COLUMN "getQuantity",
DROP COLUMN "slug",
ALTER COLUMN "discountValue" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "transactionId" TEXT,
    "status" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "courier" TEXT NOT NULL,
    "trackingCode" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);
