-- Bridge migration for databases where HomepageSection was originally created by db push.
-- It is intentionally idempotent: existing databases remain unchanged, while clean
-- shadow databases receive the pre-tenant/store table required by the next migration.

CREATE TABLE IF NOT EXISTS "HomepageSection" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "data" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "HomepageSection_slug_key"
  ON "HomepageSection"("slug");
