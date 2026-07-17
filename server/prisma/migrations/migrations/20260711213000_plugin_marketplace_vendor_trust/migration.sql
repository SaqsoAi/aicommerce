CREATE TYPE "PluginVendorStatus" AS ENUM ('PENDING','TRUSTED','SUSPENDED','REVOKED');
CREATE TYPE "PluginTrustLevel" AS ENUM ('UNTRUSTED','VERIFIED','TRUSTED','PLATFORM');
CREATE TYPE "PluginRepositoryStatus" AS ENUM ('ACTIVE','DISABLED','REVOKED');
CREATE TYPE "PluginReleaseChannel" AS ENUM ('STABLE','LTS','BETA','PREVIEW','DEVELOPMENT');
CREATE TYPE "PluginPackageTrustDecision" AS ENUM ('TRUSTED','TRUSTED_WITH_WARNING','UNTRUSTED','REVOKED','UNSUPPORTED','INCOMPATIBLE');

CREATE TABLE "PluginVendor" (
  "id" TEXT NOT NULL,
  "vendorKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "websiteUrl" TEXT,
  "contactEmail" TEXT,
  "status" "PluginVendorStatus" NOT NULL DEFAULT 'PENDING',
  "trustLevel" "PluginTrustLevel" NOT NULL DEFAULT 'UNTRUSTED',
  "metadata" JSONB,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "revokedReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PluginVendor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PluginSigningKey" (
  "id" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "keyId" TEXT NOT NULL,
  "algorithm" TEXT NOT NULL,
  "publicKeyPem" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "revokedReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PluginSigningKey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PluginRepository" (
  "id" TEXT NOT NULL,
  "repositoryKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "baseUrl" TEXT,
  "kind" TEXT NOT NULL,
  "status" "PluginRepositoryStatus" NOT NULL DEFAULT 'ACTIVE',
  "trusted" BOOLEAN NOT NULL DEFAULT false,
  "allowedChannels" "PluginReleaseChannel"[],
  "metadata" JSONB,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PluginRepository_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PluginMarketplaceEntry" (
  "id" TEXT NOT NULL,
  "pluginId" TEXT,
  "pluginVersionId" TEXT,
  "vendorId" TEXT NOT NULL,
  "signingKeyId" TEXT,
  "repositoryId" TEXT NOT NULL,
  "pluginKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "channel" "PluginReleaseChannel" NOT NULL,
  "description" TEXT,
  "minimumPlatformVersion" TEXT NOT NULL,
  "maximumPlatformVersion" TEXT NOT NULL,
  "packageSha256" TEXT NOT NULL,
  "packageSizeBytes" INTEGER NOT NULL,
  "signatureAlgorithm" TEXT,
  "signatureBase64" TEXT,
  "signedDigest" TEXT,
  "trustDecision" "PluginPackageTrustDecision" NOT NULL DEFAULT 'UNTRUSTED',
  "trustReasons" JSONB,
  "manifest" JSONB NOT NULL,
  "changelog" TEXT,
  "packageLocation" TEXT,
  "publishedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "revokedReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PluginMarketplaceEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PluginDownloadHistory" (
  "id" TEXT NOT NULL,
  "marketplaceEntryId" TEXT NOT NULL,
  "repositoryId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "packageSha256" TEXT NOT NULL,
  "trustDecision" "PluginPackageTrustDecision" NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PluginDownloadHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PluginVendor_vendorKey_key" ON "PluginVendor"("vendorKey");
CREATE INDEX "PluginVendor_status_trustLevel_idx" ON "PluginVendor"("status","trustLevel");
CREATE UNIQUE INDEX "PluginSigningKey_vendorId_keyId_key" ON "PluginSigningKey"("vendorId","keyId");
CREATE UNIQUE INDEX "PluginSigningKey_fingerprint_key" ON "PluginSigningKey"("fingerprint");
CREATE INDEX "PluginSigningKey_vendorId_active_idx" ON "PluginSigningKey"("vendorId","active");
CREATE UNIQUE INDEX "PluginRepository_repositoryKey_key" ON "PluginRepository"("repositoryKey");
CREATE UNIQUE INDEX "PluginMarketplaceEntry_repositoryId_pluginKey_version_channel_key" ON "PluginMarketplaceEntry"("repositoryId","pluginKey","version","channel");
CREATE INDEX "PluginMarketplaceEntry_pluginKey_channel_publishedAt_idx" ON "PluginMarketplaceEntry"("pluginKey","channel","publishedAt");
CREATE INDEX "PluginMarketplaceEntry_trustDecision_publishedAt_idx" ON "PluginMarketplaceEntry"("trustDecision","publishedAt");
CREATE INDEX "PluginDownloadHistory_actorId_createdAt_idx" ON "PluginDownloadHistory"("actorId","createdAt");
CREATE INDEX "PluginDownloadHistory_marketplaceEntryId_createdAt_idx" ON "PluginDownloadHistory"("marketplaceEntryId","createdAt");

ALTER TABLE "PluginSigningKey" ADD CONSTRAINT "PluginSigningKey_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "PluginVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PluginMarketplaceEntry" ADD CONSTRAINT "PluginMarketplaceEntry_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PluginMarketplaceEntry" ADD CONSTRAINT "PluginMarketplaceEntry_pluginVersionId_fkey" FOREIGN KEY ("pluginVersionId") REFERENCES "PluginVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PluginMarketplaceEntry" ADD CONSTRAINT "PluginMarketplaceEntry_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "PluginVendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PluginMarketplaceEntry" ADD CONSTRAINT "PluginMarketplaceEntry_signingKeyId_fkey" FOREIGN KEY ("signingKeyId") REFERENCES "PluginSigningKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PluginMarketplaceEntry" ADD CONSTRAINT "PluginMarketplaceEntry_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "PluginRepository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PluginDownloadHistory" ADD CONSTRAINT "PluginDownloadHistory_marketplaceEntryId_fkey" FOREIGN KEY ("marketplaceEntryId") REFERENCES "PluginMarketplaceEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PluginDownloadHistory" ADD CONSTRAINT "PluginDownloadHistory_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "PluginRepository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
