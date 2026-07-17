-- AlterTable
ALTER TABLE "Hero" ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "HeroSlide" ADD COLUMN     "buttonPosition" TEXT DEFAULT 'center',
ADD COLUMN     "primaryButtonLink" TEXT,
ADD COLUMN     "primaryButtonText" TEXT,
ADD COLUMN     "secondaryButtonLink" TEXT,
ADD COLUMN     "secondaryButtonText" TEXT;
