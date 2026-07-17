-- CreateTable
CREATE TABLE "ProductCodeSettings" (
    "id" TEXT NOT NULL,
    "barcodePrefix" TEXT NOT NULL DEFAULT '899001',
    "stylePrefix" TEXT NOT NULL DEFAULT 'PRD',
    "barcodeCounter" INTEGER NOT NULL DEFAULT 1,
    "styleCounter" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCodeSettings_pkey" PRIMARY KEY ("id")
);
