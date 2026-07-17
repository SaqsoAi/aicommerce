/*
  Warnings:

  - You are about to drop the column `endDate` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `Hero` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hero" DROP COLUMN "endDate",
DROP COLUMN "image",
DROP COLUMN "type",
DROP COLUMN "video";

-- DropEnum
DROP TYPE "HeroType";

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "heroId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "secondaryText" TEXT,
    "secondaryLink" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_slug_key" ON "Template"("slug");

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;
