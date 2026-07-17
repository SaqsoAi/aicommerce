-- H3 additive tenant/store homepage isolation foundation.
-- Existing rows remain nullable and MUST be backfilled explicitly.

CREATE TABLE "Tenant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "storefrontEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE INDEX "Tenant_status_storefrontEnabled_idx" ON "Tenant"("status", "storefrontEnabled");

ALTER TABLE "Store"
  ADD COLUMN "tenantId" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "storefrontEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "primaryDomain" TEXT;
CREATE INDEX "Store_tenantId_idx" ON "Store"("tenantId");
CREATE INDEX "Store_status_storefrontEnabled_idx" ON "Store"("status", "storefrontEnabled");

CREATE TABLE "StorefrontDomain" (
  "id" TEXT NOT NULL,
  "hostname" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "tenantId" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StorefrontDomain_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StorefrontDomain_hostname_key" ON "StorefrontDomain"("hostname");
CREATE INDEX "StorefrontDomain_tenantId_storeId_idx" ON "StorefrontDomain"("tenantId", "storeId");
CREATE INDEX "StorefrontDomain_status_idx" ON "StorefrontDomain"("status");

ALTER TABLE "HomepageSection"
  ADD COLUMN "tenantId" TEXT,
  ADD COLUMN "storeId" TEXT;
CREATE INDEX "HomepageSection_tenantId_storeId_enabled_sortOrder_idx"
  ON "HomepageSection"("tenantId", "storeId", "enabled", "sortOrder");
CREATE INDEX "HomepageSection_storeId_slug_idx"
  ON "HomepageSection"("storeId", "slug");

ALTER TABLE "Store"
  ADD CONSTRAINT "Store_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StorefrontDomain"
  ADD CONSTRAINT "StorefrontDomain_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StorefrontDomain"
  ADD CONSTRAINT "StorefrontDomain_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HomepageSection"
  ADD CONSTRAINT "HomepageSection_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HomepageSection"
  ADD CONSTRAINT "HomepageSection_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
