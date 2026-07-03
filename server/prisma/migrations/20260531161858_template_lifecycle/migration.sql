/*
  Warnings:

  - You are about to drop the column `active` on the `InstalledTemplate` table. All the data in the column will be lost.
  - Made the column `storeId` on table `InstalledTemplate` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "InstalledTemplate" DROP CONSTRAINT "InstalledTemplate_storeId_fkey";

-- AlterTable
ALTER TABLE "InstalledTemplate" DROP COLUMN "active",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ALTER COLUMN "version" DROP DEFAULT,
ALTER COLUMN "storeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "InstalledTemplate" ADD CONSTRAINT "InstalledTemplate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
