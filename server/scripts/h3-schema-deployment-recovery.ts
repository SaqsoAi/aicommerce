import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

type Row = Record<string, unknown>;

async function query(sql: string): Promise<Row[]> {
  return prisma.$queryRawUnsafe<Row[]>(sql);
}

async function execute(sql: string): Promise<void> {
  await prisma.$executeRawUnsafe(sql);
}

async function tableExists(table: string): Promise<boolean> {
  const safe = table.replace(/"/g, "");
  const rows = await query(
    `SELECT to_regclass('"${safe}"')::text AS value`,
  );
  return Boolean(rows[0]?.value);
}

async function columnExists(
  table: string,
  column: string,
): Promise<boolean> {
  const safeTable = table.replace(/'/g, "''");
  const safeColumn = column.replace(/'/g, "''");

  const rows = await query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = '${safeTable}'
        AND column_name = '${safeColumn}'
    ) AS value
  `);

  return Boolean(rows[0]?.value);
}

async function constraintExists(name: string): Promise<boolean> {
  const safe = name.replace(/'/g, "''");
  const rows = await query(`
    SELECT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = '${safe}'
    ) AS value
  `);

  return Boolean(rows[0]?.value);
}

async function main(): Promise<void> {
  const projectRoot = path.resolve(process.argv[2] || "D:\\AI-ECOMMERCE");
  const reportRoot = path.resolve(
    process.argv[3] ||
      path.join(
        projectRoot,
        "PROJECT_AUDIT",
        "H3_SCHEMA_DEPLOYMENT_RECOVERY",
      ),
  );

  fs.mkdirSync(reportRoot, { recursive: true });

  const before = {
    tenantTable: await tableExists("Tenant"),
    storefrontDomainTable: await tableExists("StorefrontDomain"),
    storeTenantId: await columnExists("Store", "tenantId"),
    storeStatus: await columnExists("Store", "status"),
    storeStorefrontEnabled: await columnExists(
      "Store",
      "storefrontEnabled",
    ),
    storePrimaryDomain: await columnExists("Store", "primaryDomain"),
    homepageTenantId: await columnExists(
      "HomepageSection",
      "tenantId",
    ),
    homepageStoreId: await columnExists(
      "HomepageSection",
      "storeId",
    ),
    userTenantId: await columnExists("User", "tenantId"),
    userStoreId: await columnExists("User", "storeId"),
  };

  const ddl = `
BEGIN;

CREATE TABLE IF NOT EXISTS "Tenant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "storefrontEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_slug_key"
  ON "Tenant"("slug");

CREATE INDEX IF NOT EXISTS "Tenant_status_storefrontEnabled_idx"
  ON "Tenant"("status", "storefrontEnabled");

ALTER TABLE "Store"
  ADD COLUMN IF NOT EXISTS "tenantId" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "storefrontEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "primaryDomain" TEXT;

CREATE INDEX IF NOT EXISTS "Store_tenantId_idx"
  ON "Store"("tenantId");

CREATE INDEX IF NOT EXISTS "Store_status_storefrontEnabled_idx"
  ON "Store"("status", "storefrontEnabled");

CREATE TABLE IF NOT EXISTS "StorefrontDomain" (
  "id" TEXT NOT NULL,
  "hostname" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "tenantId" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StorefrontDomain_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StorefrontDomain_hostname_key"
  ON "StorefrontDomain"("hostname");

CREATE INDEX IF NOT EXISTS "StorefrontDomain_tenantId_storeId_idx"
  ON "StorefrontDomain"("tenantId", "storeId");

CREATE INDEX IF NOT EXISTS "StorefrontDomain_status_idx"
  ON "StorefrontDomain"("status");

ALTER TABLE "HomepageSection"
  ADD COLUMN IF NOT EXISTS "tenantId" TEXT,
  ADD COLUMN IF NOT EXISTS "storeId" TEXT;

CREATE INDEX IF NOT EXISTS
  "HomepageSection_tenantId_storeId_enabled_sortOrder_idx"
  ON "HomepageSection"(
    "tenantId",
    "storeId",
    "enabled",
    "sortOrder"
  );

CREATE INDEX IF NOT EXISTS "HomepageSection_storeId_slug_idx"
  ON "HomepageSection"("storeId", "slug");

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "tenantId" TEXT,
  ADD COLUMN IF NOT EXISTS "storeId" TEXT;

CREATE INDEX IF NOT EXISTS "User_tenantId_idx"
  ON "User"("tenantId");

CREATE INDEX IF NOT EXISTS "User_storeId_idx"
  ON "User"("storeId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Store_tenantId_fkey'
  ) THEN
    ALTER TABLE "Store"
      ADD CONSTRAINT "Store_tenantId_fkey"
      FOREIGN KEY ("tenantId")
      REFERENCES "Tenant"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'StorefrontDomain_tenantId_fkey'
  ) THEN
    ALTER TABLE "StorefrontDomain"
      ADD CONSTRAINT "StorefrontDomain_tenantId_fkey"
      FOREIGN KEY ("tenantId")
      REFERENCES "Tenant"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'StorefrontDomain_storeId_fkey'
  ) THEN
    ALTER TABLE "StorefrontDomain"
      ADD CONSTRAINT "StorefrontDomain_storeId_fkey"
      FOREIGN KEY ("storeId")
      REFERENCES "Store"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'HomepageSection_tenantId_fkey'
  ) THEN
    ALTER TABLE "HomepageSection"
      ADD CONSTRAINT "HomepageSection_tenantId_fkey"
      FOREIGN KEY ("tenantId")
      REFERENCES "Tenant"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'HomepageSection_storeId_fkey'
  ) THEN
    ALTER TABLE "HomepageSection"
      ADD CONSTRAINT "HomepageSection_storeId_fkey"
      FOREIGN KEY ("storeId")
      REFERENCES "Store"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'User_tenantId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_tenantId_fkey"
      FOREIGN KEY ("tenantId")
      REFERENCES "Tenant"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'User_storeId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_storeId_fkey"
      FOREIGN KEY ("storeId")
      REFERENCES "Store"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;
`;

  await execute(ddl);

  const after = {
    tenantTable: await tableExists("Tenant"),
    storefrontDomainTable: await tableExists("StorefrontDomain"),
    storeTenantId: await columnExists("Store", "tenantId"),
    storeStatus: await columnExists("Store", "status"),
    storeStorefrontEnabled: await columnExists(
      "Store",
      "storefrontEnabled",
    ),
    storePrimaryDomain: await columnExists("Store", "primaryDomain"),
    homepageTenantId: await columnExists(
      "HomepageSection",
      "tenantId",
    ),
    homepageStoreId: await columnExists(
      "HomepageSection",
      "storeId",
    ),
    userTenantId: await columnExists("User", "tenantId"),
    userStoreId: await columnExists("User", "storeId"),
    constraints: {
      storeTenant: await constraintExists("Store_tenantId_fkey"),
      domainTenant: await constraintExists(
        "StorefrontDomain_tenantId_fkey",
      ),
      domainStore: await constraintExists(
        "StorefrontDomain_storeId_fkey",
      ),
      homepageTenant: await constraintExists(
        "HomepageSection_tenantId_fkey",
      ),
      homepageStore: await constraintExists(
        "HomepageSection_storeId_fkey",
      ),
      userTenant: await constraintExists("User_tenantId_fkey"),
      userStore: await constraintExists("User_storeId_fkey"),
    },
  };

  const required = [
    after.tenantTable,
    after.storefrontDomainTable,
    after.storeTenantId,
    after.storeStatus,
    after.storeStorefrontEnabled,
    after.storePrimaryDomain,
    after.homepageTenantId,
    after.homepageStoreId,
    after.userTenantId,
    after.userStoreId,
    ...Object.values(after.constraints),
  ];

  const success = required.every(Boolean);

  const report = {
    generatedAt: new Date().toISOString(),
    status: success ? "PASS" : "FAIL",
    mode: "IDEMPOTENT_SCHEMA_RECOVERY",
    databaseRowsBackfilled: false,
    migrationHistoryChanged: false,
    before,
    after,
  };

  fs.writeFileSync(
    path.join(reportRoot, "H3_SCHEMA_DEPLOYMENT_RECOVERY_REPORT.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  fs.writeFileSync(
    path.join(reportRoot, "H3_SCHEMA_DEPLOYMENT_RECOVERY_REPORT.md"),
    `# H3 Schema Deployment Recovery Report

Status: **${report.status}**

Generated: ${report.generatedAt}

## Mode

Idempotent transactional schema recovery.

## Database Rows

No Tenant, Store, Domain, HomepageSection, StoreSetting or User ownership row was assigned.

## Migration History

The existing migration history record was not changed.

## Before

\`\`\`json
${JSON.stringify(before, null, 2)}
\`\`\`

## After

\`\`\`json
${JSON.stringify(after, null, 2)}
\`\`\`
`,
    "utf8",
  );

  console.log(`H3 schema recovery status: ${report.status}`);
  console.log(`Report directory: ${reportRoot}`);

  if (!success) process.exitCode = 2;
}

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error
        ? error.stack || error.message
        : String(error),
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
