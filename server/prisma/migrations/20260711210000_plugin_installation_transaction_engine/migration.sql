CREATE TYPE "PluginTransactionStatus" AS ENUM (
  'PREPARING',
  'VALIDATING',
  'BACKING_UP',
  'APPLYING_FILES',
  'MIGRATION_REVIEW_REQUIRED',
  'VERIFYING',
  'COMMITTING',
  'SUCCEEDED',
  'FAILED',
  'ROLLING_BACK',
  'ROLLED_BACK'
);

CREATE TABLE "PluginInstallTransaction" (
  "id" TEXT NOT NULL,
  "pluginId" TEXT NOT NULL,
  "installationId" TEXT NOT NULL,
  "status" "PluginTransactionStatus" NOT NULL DEFAULT 'PREPARING',
  "planFingerprint" TEXT NOT NULL,
  "packageSha256" TEXT NOT NULL,
  "stagingPath" TEXT NOT NULL,
  "backupPath" TEXT,
  "journal" JSONB,
  "migrationGate" JSONB,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "requestedBy" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PluginInstallTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PluginFileOperation" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "owner" TEXT NOT NULL,
  "destinationPath" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "previousSha256" TEXT,
  "expectedSha256" TEXT NOT NULL,
  "appliedSha256" TEXT,
  "status" TEXT NOT NULL,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PluginFileOperation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PluginTransactionLog" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PluginTransactionLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PluginInstallTransaction_pluginId_createdAt_idx"
  ON "PluginInstallTransaction"("pluginId", "createdAt");
CREATE INDEX "PluginInstallTransaction_installationId_idx"
  ON "PluginInstallTransaction"("installationId");
CREATE INDEX "PluginInstallTransaction_status_createdAt_idx"
  ON "PluginInstallTransaction"("status", "createdAt");
CREATE UNIQUE INDEX "PluginFileOperation_transactionId_sequence_key"
  ON "PluginFileOperation"("transactionId", "sequence");
CREATE INDEX "PluginFileOperation_transactionId_status_idx"
  ON "PluginFileOperation"("transactionId", "status");
CREATE INDEX "PluginTransactionLog_transactionId_createdAt_idx"
  ON "PluginTransactionLog"("transactionId", "createdAt");

ALTER TABLE "PluginInstallTransaction"
  ADD CONSTRAINT "PluginInstallTransaction_pluginId_fkey"
  FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PluginInstallTransaction"
  ADD CONSTRAINT "PluginInstallTransaction_installationId_fkey"
  FOREIGN KEY ("installationId") REFERENCES "PluginInstallation"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PluginFileOperation"
  ADD CONSTRAINT "PluginFileOperation_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "PluginInstallTransaction"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PluginTransactionLog"
  ADD CONSTRAINT "PluginTransactionLog_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "PluginInstallTransaction"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
