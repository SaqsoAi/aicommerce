/*
  Warnings:

  - You are about to drop the column `discount` on the `Campaign` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discountType` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountValue` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "discount",
ADD COLUMN     "banner" TEXT,
ADD COLUMN     "buyQuantity" INTEGER,
ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "discountType" TEXT NOT NULL,
ADD COLUMN     "discountValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "getQuantity" INTEGER,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");
