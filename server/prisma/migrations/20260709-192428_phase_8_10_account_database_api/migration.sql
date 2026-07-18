-- PHASE 8.10 ACCOUNT DATABASE & API
-- Review before applying to production.
-- This migration creates account profile, address, membership, reward ledger and style preference tables.

CREATE TABLE IF NOT EXISTS "AccountProfile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "displayName" TEXT,
  "avatarUrl" TEXT,
  "phone" TEXT,
  "dateOfBirth" TIMESTAMP(3),
  "gender" TEXT,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AccountAddress" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "profileId" TEXT,
  "label" TEXT NOT NULL DEFAULT 'Home',
  "fullName" TEXT,
  "phone" TEXT,
  "line1" TEXT NOT NULL,
  "line2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "country" TEXT NOT NULL DEFAULT 'Bangladesh',
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountAddress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "AccountProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AccountMembership" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "profileId" TEXT UNIQUE,
  "tier" TEXT NOT NULL DEFAULT 'Bronze',
  "stylePoints" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountMembership_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "AccountProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AccountRewardLedger" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "profileId" TEXT,
  "points" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "reason" TEXT,
  "referenceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountRewardLedger_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "AccountProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AccountStylePreference" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "profileId" TEXT UNIQUE,
  "preferredFit" TEXT,
  "sizesJson" TEXT,
  "colorsJson" TEXT,
  "categoriesJson" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountStylePreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "AccountProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AccountProfile_userId_idx" ON "AccountProfile"("userId");
CREATE INDEX IF NOT EXISTS "AccountAddress_userId_idx" ON "AccountAddress"("userId");
CREATE INDEX IF NOT EXISTS "AccountAddress_profileId_idx" ON "AccountAddress"("profileId");
CREATE INDEX IF NOT EXISTS "AccountMembership_userId_idx" ON "AccountMembership"("userId");
CREATE INDEX IF NOT EXISTS "AccountMembership_tier_idx" ON "AccountMembership"("tier");
CREATE INDEX IF NOT EXISTS "AccountRewardLedger_userId_idx" ON "AccountRewardLedger"("userId");
CREATE INDEX IF NOT EXISTS "AccountRewardLedger_profileId_idx" ON "AccountRewardLedger"("profileId");
CREATE INDEX IF NOT EXISTS "AccountRewardLedger_type_idx" ON "AccountRewardLedger"("type");
CREATE INDEX IF NOT EXISTS "AccountStylePreference_userId_idx" ON "AccountStylePreference"("userId");