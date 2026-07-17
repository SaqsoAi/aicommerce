/*
  Warnings:

  - You are about to drop the column `storeId` on the `InstalledTemplate` table. All the data in the column will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InstalledTemplate" DROP CONSTRAINT "InstalledTemplate_storeId_fkey";

-- AlterTable
ALTER TABLE "Hero" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "buttonLink" TEXT,
ADD COLUMN     "buttonText" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "secondaryLink" TEXT,
ADD COLUMN     "secondaryText" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'slider',
ADD COLUMN     "video" TEXT;

-- AlterTable
ALTER TABLE "InstalledTemplate" DROP COLUMN "storeId";

-- DropTable
DROP TABLE "Store";
