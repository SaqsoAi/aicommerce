/*
  Warnings:

  - You are about to drop the column `active` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `desktopImage` on the `HeroSlide` table. All the data in the column will be lost.
  - You are about to drop the column `mobileImage` on the `HeroSlide` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryLink` on the `HeroSlide` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryText` on the `HeroSlide` table. All the data in the column will be lost.
  - You are about to drop the column `tabletImage` on the `HeroSlide` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hero" DROP COLUMN "active",
DROP COLUMN "endDate",
DROP COLUMN "startDate";

-- AlterTable
ALTER TABLE "HeroSlide" DROP COLUMN "desktopImage",
DROP COLUMN "mobileImage",
DROP COLUMN "secondaryLink",
DROP COLUMN "secondaryText",
DROP COLUMN "tabletImage";
