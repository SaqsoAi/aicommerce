/*
  Warnings:

  - You are about to drop the column `active` on the `StoreTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `StoreTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `StoreTemplate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storeId,templateId]` on the table `StoreTemplate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `StoreTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateId` to the `StoreTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StoreTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StoreTemplate_slug_key";

-- AlterTable
ALTER TABLE "StoreTemplate" DROP COLUMN "active",
DROP COLUMN "name",
DROP COLUMN "slug",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "storeId" TEXT NOT NULL,
ADD COLUMN     "templateId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "previewUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreTemplate_storeId_idx" ON "StoreTemplate"("storeId");

-- CreateIndex
CREATE INDEX "StoreTemplate_templateId_idx" ON "StoreTemplate"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreTemplate_storeId_templateId_key" ON "StoreTemplate"("storeId", "templateId");

-- AddForeignKey
ALTER TABLE "StoreTemplate" ADD CONSTRAINT "StoreTemplate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreTemplate" ADD CONSTRAINT "StoreTemplate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
