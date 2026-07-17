import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

type Row = Record<string, unknown>;
type FindingLevel = "PASS" | "WARN" | "BLOCKED" | "FAIL";
type Finding = {
  key: string;
  level: FindingLevel;
  message: string;
  evidence?: unknown;
};

function stringify(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, item) => typeof item === "bigint" ? item.toString() : item,
    2,
  );
}

async function raw(sql: string): Promise<Row[]> {
  return prisma.$queryRawUnsafe<Row[]>(sql);
}

async function tableExists(table: string): Promise<boolean> {
  const safe = table.replace(/"/g, "");
  const rows = await raw(`SELECT to_regclass('"${safe}"')::text AS value`);
  return Boolean(rows[0]?.value);
}

async function columnExists(
  table: string,
  column: string,
): Promise<boolean> {
  const safeTable = table.replace(/'/g, "''");
  const safeColumn = column.replace(/'/g, "''");

  const rows = await raw(`
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

function markdownTable(rows: Row[]): string {
  if (!rows.length) return "_No rows found or query not applicable._\n";

  const keys = Object.keys(rows[0]);
  const header = `| ${keys.join(" | ")} |`;
  const separator = `| ${keys.map(() => "---").join(" | ")} |`;

  const body = rows.map((row) =>
    `| ${keys
      .map((key) =>
        String(row[key] ?? "")
          .replace(/\r?\n/g, " ")
          .replace(/\|/g, "\\|"),
      )
      .join(" | ")} |`
  );

  return [header, separator, ...body].join("\n") + "\n";
}

function sourceContains(file: string, text: string): boolean {
  return fs.existsSync(file) && fs.readFileSync(file, "utf8").includes(text);
}

function countOccurrences(file: string, text: string): number {
  if (!fs.existsSync(file)) return 0;
  return fs.readFileSync(file, "utf8").split(text).length - 1;
}

async function main(): Promise<void> {
  const projectRoot = path.resolve(process.argv[2] || "D:\\AI-ECOMMERCE");
  const auditRoot = path.resolve(
    process.argv[3] ||
      path.join(
        projectRoot,
        "PROJECT_AUDIT",
        "H3_FINAL_OWNERSHIP_AUDIT_V2_1",
      ),
  );

  fs.mkdirSync(auditRoot, { recursive: true });

  const serverRoot = path.join(projectRoot, "server");
  const clientRoot = path.join(projectRoot, "client");

  const files = {
    schema: path.join(serverRoot, "prisma", "schema.prisma"),
    migration: path.join(
      serverRoot,
      "prisma",
      "migrations",
      "20260713010000_homepage_tenant_store_isolation",
      "migration.sql",
    ),
    app: path.join(serverRoot, "src", "app.ts"),
    route: path.join(
      serverRoot,
      "src",
      "modules",
      "storefront-runtime",
      "storefront-runtime.routes.ts",
    ),
    service: path.join(
      serverRoot,
      "src",
      "modules",
      "storefront-runtime",
      "storefront-runtime.service.ts",
    ),
    hostname: path.join(
      serverRoot,
      "src",
      "modules",
      "storefront-runtime",
      "hostname.ts",
    ),
    homepageService: path.join(
      serverRoot,
      "src",
      "modules",
      "homepage-section",
      "homepage-section.service.ts",
    ),
    clientRuntime: path.join(
      clientRoot,
      "src",
      "lib",
      "homepage-runtime.ts",
    ),
  };

  const findings: Finding[] = [];

  for (const [key, file] of Object.entries(files)) {
    findings.push({
      key: `source.${key}`,
      level: fs.existsSync(file) ? "PASS" : "BLOCKED",
      message: fs.existsSync(file)
        ? `Source file exists: ${path.relative(projectRoot, file)}`
        : `Required source file is missing: ${path.relative(projectRoot, file)}`,
    });
  }

  findings.push({
    key: "source.route.registration",
    level:
      countOccurrences(
        files.app,
        'import storefrontRuntimeRoutes from "./modules/storefront-runtime/storefront-runtime.routes";',
      ) === 1 &&
      countOccurrences(
        files.app,
        'app.use("/api/storefront", storefrontRuntimeRoutes);',
      ) === 1
        ? "PASS"
        : "BLOCKED",
    message:
      "Canonical storefront route import and registration must exist exactly once.",
    evidence: {
      importCount: countOccurrences(
        files.app,
        'import storefrontRuntimeRoutes from "./modules/storefront-runtime/storefront-runtime.routes";',
      ),
      routeCount: countOccurrences(
        files.app,
        'app.use("/api/storefront", storefrontRuntimeRoutes);',
      ),
    },
  });

  findings.push({
    key: "source.runtime.scope",
    level:
      sourceContains(files.service, "tenantId: context.tenantId") &&
      sourceContains(files.service, "storeId: context.storeId")
        ? "PASS"
        : "BLOCKED",
    message:
      "Public homepage query must include tenantId and storeId.",
  });

  findings.push({
    key: "source.admin.idor",
    level:
      sourceContains(files.homepageService, "assertOwned") &&
      sourceContains(
        files.homepageService,
        "One or more homepage sections are outside the current store",
      )
        ? "PASS"
        : "BLOCKED",
    message:
      "Admin mutations must verify ownership and reject foreign reorder IDs.",
  });

  findings.push({
    key: "source.client.scope",
    level:
      sourceContains(files.clientRuntime, "/storefront/runtime") &&
      !sourceContains(files.clientRuntime, "/enterprise-settings") &&
      !sourceContains(files.clientRuntime, "/homepage-sections/active")
        ? "PASS"
        : "BLOCKED",
    message:
      "Client runtime must use the scoped storefront runtime endpoint only.",
  });

  const tableNames = [
    "Tenant",
    "Store",
    "StorefrontDomain",
    "HomepageSection",
    "StoreSetting",
    "User",
    "_prisma_migrations",
  ];

  const tableFlags: Record<string, boolean> = {};
  const tableState: Row[] = [];

  for (const table of tableNames) {
    const exists = await tableExists(table);
    tableFlags[table] = exists;
    tableState.push({ table, exists });
  }

  const requiredColumns: Array<[string, string]> = [
    ["Store", "tenantId"],
    ["Store", "status"],
    ["Store", "storefrontEnabled"],
    ["Store", "primaryDomain"],
    ["HomepageSection", "tenantId"],
    ["HomepageSection", "storeId"],
    ["User", "tenantId"],
    ["User", "storeId"],
  ];

  const columnFlags: Record<string, boolean> = {};
  const columnState: Row[] = [];

  for (const [table, column] of requiredColumns) {
    const exists =
      Boolean(tableFlags[table]) && await columnExists(table, column);

    columnFlags[`${table}.${column}`] = exists;
    columnState.push({ table, column, exists });
  }

  const hasStoreOwnership =
    tableFlags.Store &&
    columnFlags["Store.tenantId"] &&
    columnFlags["Store.status"] &&
    columnFlags["Store.storefrontEnabled"] &&
    columnFlags["Store.primaryDomain"];

  const hasSectionOwnership =
    tableFlags.HomepageSection &&
    columnFlags["HomepageSection.tenantId"] &&
    columnFlags["HomepageSection.storeId"];

  const hasUserOwnership =
    tableFlags.User &&
    columnFlags["User.tenantId"] &&
    columnFlags["User.storeId"];

  const tenants = tableFlags.Tenant
    ? await raw(`
        SELECT
          "id", "name", "slug", "status",
          "storefrontEnabled", "createdAt", "updatedAt"
        FROM "Tenant"
        ORDER BY "createdAt", "id"
      `)
    : [];

  const stores = hasStoreOwnership
    ? await raw(`
        SELECT
          "id", "name", "tenantId", "status",
          "storefrontEnabled", "primaryDomain",
          "createdAt", "updatedAt"
        FROM "Store"
        ORDER BY "createdAt", "id"
      `)
    : tableFlags.Store
      ? await raw(`
          SELECT "id", "name", "createdAt", "updatedAt"
          FROM "Store"
          ORDER BY "createdAt", "id"
        `)
      : [];

  const domains = tableFlags.StorefrontDomain
    ? await raw(`
        SELECT
          "id", "hostname", "status", "isPrimary",
          "tenantId", "storeId", "createdAt", "updatedAt"
        FROM "StorefrontDomain"
        ORDER BY "hostname"
      `)
    : [];

  const sectionSummary = hasSectionOwnership
    ? await raw(`
        SELECT
          COALESCE("tenantId", '<NULL>') AS "tenantId",
          COALESCE("storeId", '<NULL>') AS "storeId",
          COUNT(*)::text AS "sectionCount",
          COUNT(*) FILTER (WHERE "enabled" = true)::text AS "enabledCount"
        FROM "HomepageSection"
        GROUP BY "tenantId", "storeId"
        ORDER BY "tenantId", "storeId"
      `)
    : [];

  const unownedSections = hasSectionOwnership
    ? await raw(`
        SELECT
          "id", "title", "slug", "type", "enabled",
          "sortOrder", "tenantId", "storeId"
        FROM "HomepageSection"
        WHERE "tenantId" IS NULL OR "storeId" IS NULL
        ORDER BY "sortOrder", "id"
      `)
    : [];

  const orphanStores =
    tableFlags.Tenant && hasStoreOwnership
      ? await raw(`
          SELECT
            s."id", s."name", s."tenantId",
            s."status", s."storefrontEnabled"
          FROM "Store" s
          LEFT JOIN "Tenant" t ON t."id" = s."tenantId"
          WHERE s."tenantId" IS NULL OR t."id" IS NULL
          ORDER BY s."name", s."id"
        `)
      : [];

  const invalidDomains =
    tableFlags.Tenant &&
    hasStoreOwnership &&
    tableFlags.StorefrontDomain
      ? await raw(`
          SELECT
            d."id", d."hostname", d."tenantId", d."storeId",
            d."status", d."isPrimary",
            s."tenantId" AS "storeTenantId"
          FROM "StorefrontDomain" d
          LEFT JOIN "Store" s ON s."id" = d."storeId"
          LEFT JOIN "Tenant" t ON t."id" = d."tenantId"
          WHERE s."id" IS NULL
             OR t."id" IS NULL
             OR s."tenantId" IS DISTINCT FROM d."tenantId"
          ORDER BY d."hostname"
        `)
      : [];

  const duplicatePrimaryDomains = tableFlags.StorefrontDomain
    ? await raw(`
        SELECT "storeId", COUNT(*)::text AS "primaryCount"
        FROM "StorefrontDomain"
        WHERE "isPrimary" = true
        GROUP BY "storeId"
        HAVING COUNT(*) > 1
      `)
    : [];

  const storesWithoutPrimaryDomain =
    hasStoreOwnership && tableFlags.StorefrontDomain
      ? await raw(`
          SELECT
            s."id", s."name", s."tenantId", s."primaryDomain"
          FROM "Store" s
          LEFT JOIN "StorefrontDomain" d
            ON d."storeId" = s."id"
           AND d."isPrimary" = true
          WHERE d."id" IS NULL
          ORDER BY s."name", s."id"
        `)
      : [];

  const unsafeGlobalSettings = tableFlags.StoreSetting
    ? await raw(`
        SELECT
          "id", "singletonKey", "storeName", "activeTemplate"
        FROM "StoreSetting"
        WHERE "singletonKey" NOT LIKE 'store:%'
        ORDER BY "singletonKey"
      `)
    : [];

  const missingScopedSettings =
    hasStoreOwnership && tableFlags.StoreSetting
      ? await raw(`
          SELECT
            s."id" AS "storeId",
            s."name" AS "storeName",
            CONCAT('store:', s."id") AS "requiredKey"
          FROM "Store" s
          LEFT JOIN "StoreSetting" st
            ON st."singletonKey" = CONCAT('store:', s."id")
          WHERE st."id" IS NULL
          ORDER BY s."name", s."id"
        `)
      : [];

  const adminUsers = hasUserOwnership
    ? await raw(`
        SELECT "id", "email", "role", "tenantId", "storeId"
        FROM "User"
        WHERE "role" IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
        ORDER BY "role", "email"
      `)
    : [];

  const unscopedAdminUsers = hasUserOwnership
    ? await raw(`
        SELECT "id", "email", "role", "tenantId", "storeId"
        FROM "User"
        WHERE "role" IN ('ADMIN', 'MANAGER')
          AND ("tenantId" IS NULL OR "storeId" IS NULL)
        ORDER BY "role", "email"
      `)
    : [];

  const migrationHistory = tableFlags._prisma_migrations
    ? await raw(`
        SELECT
          migration_name AS "migrationName",
          finished_at AS "finishedAt",
          rolled_back_at AS "rolledBackAt",
          logs
        FROM "_prisma_migrations"
        WHERE migration_name =
          '20260713010000_homepage_tenant_store_isolation'
        ORDER BY started_at DESC
      `)
    : [];

  const runtimeRows =
    tableFlags.Tenant &&
    hasStoreOwnership &&
    tableFlags.StorefrontDomain &&
    hasSectionOwnership
      ? await raw(`
          SELECT
            d."hostname",
            d."status" AS "domainStatus",
            d."isPrimary",
            t."id" AS "tenantId",
            t."slug" AS "tenantSlug",
            t."status" AS "tenantStatus",
            t."storefrontEnabled" AS "tenantStorefrontEnabled",
            s."id" AS "storeId",
            s."name" AS "storeName",
            s."status" AS "storeStatus",
            s."storefrontEnabled" AS "storeStorefrontEnabled",
            COUNT(h."id")::text AS "enabledHomepageSections"
          FROM "StorefrontDomain" d
          JOIN "Tenant" t ON t."id" = d."tenantId"
          JOIN "Store" s ON s."id" = d."storeId"
          LEFT JOIN "HomepageSection" h
            ON h."tenantId" = d."tenantId"
           AND h."storeId" = d."storeId"
           AND h."enabled" = true
          GROUP BY
            d."hostname", d."status", d."isPrimary",
            t."id", t."slug", t."status", t."storefrontEnabled",
            s."id", s."name", s."status", s."storefrontEnabled"
          ORDER BY d."hostname"
        `)
      : [];

  const blockers: string[] = [];

  for (const row of tableState) {
    if (!row.exists) blockers.push(`Missing required table: ${row.table}`);
  }

  for (const row of columnState) {
    if (!row.exists) {
      blockers.push(`Missing required column: ${row.table}.${row.column}`);
    }
  }

  if (!migrationHistory.length) {
    blockers.push(
      "H3 migration is not recorded as successfully applied in _prisma_migrations.",
    );
  }

  if (orphanStores.length) {
    blockers.push(`${orphanStores.length} Store row(s) have no valid Tenant.`);
  }

  if (invalidDomains.length) {
    blockers.push(
      `${invalidDomains.length} StorefrontDomain row(s) have invalid ownership.`,
    );
  }

  if (duplicatePrimaryDomains.length) {
    blockers.push("At least one Store has multiple primary domains.");
  }

  if (storesWithoutPrimaryDomain.length) {
    blockers.push(
      `${storesWithoutPrimaryDomain.length} Store row(s) have no primary domain.`,
    );
  }

  if (unownedSections.length) {
    blockers.push(
      `${unownedSections.length} HomepageSection row(s) are not fully owned.`,
    );
  }

  if (unsafeGlobalSettings.length) {
    blockers.push(
      `${unsafeGlobalSettings.length} StoreSetting row(s) remain globally keyed.`,
    );
  }

  if (missingScopedSettings.length) {
    blockers.push(
      `${missingScopedSettings.length} Store row(s) have no store:<storeId> setting.`,
    );
  }

  if (unscopedAdminUsers.length) {
    blockers.push(
      `${unscopedAdminUsers.length} ADMIN/MANAGER user(s) lack tenant/store scope.`,
    );
  }

  for (const finding of findings) {
    if (finding.level === "BLOCKED" || finding.level === "FAIL") {
      blockers.push(`${finding.key}: ${finding.message}`);
    }
  }

  if (
    blockers.length === 0 &&
    (tenants.length < 2 || stores.length < 2 || domains.length < 2)
  ) {
    blockers.push(
      "At least two Tenant/Store/Domain fixtures are required for cross-tenant certification.",
    );
  }

  const status =
    blockers.length === 0
      ? "READY_FOR_CROSS_TENANT_CERTIFICATION"
      : "BACKFILL_OR_SCHEMA_FIX_REQUIRED";

  const summary = {
    generatedAt: new Date().toISOString(),
    projectRoot,
    status,
    counts: {
      tenants: tenants.length,
      stores: stores.length,
      domains: domains.length,
      unownedSections: unownedSections.length,
      orphanStores: orphanStores.length,
      invalidDomains: invalidDomains.length,
      duplicatePrimaryDomains: duplicatePrimaryDomains.length,
      storesWithoutPrimaryDomain: storesWithoutPrimaryDomain.length,
      unsafeGlobalSettings: unsafeGlobalSettings.length,
      missingScopedSettings: missingScopedSettings.length,
      unscopedAdminUsers: unscopedAdminUsers.length,
      migrationRecords: migrationHistory.length,
    },
    blockers,
  };

  const ownershipReport = `# PHASE H3 FINAL OWNERSHIP AUDIT V2.1

Generated: ${summary.generatedAt}

## Status

**${status}**

## Important Result

This audit is tolerant of missing H3 database columns. Missing tables or columns are reported as blockers instead of crashing the audit.

## Blockers

${blockers.length
  ? blockers.map((item) => `- ${item}`).join("\n")
  : "- No blocker detected."}

## Source Findings

${markdownTable(
  findings.map((item) => ({
    key: item.key,
    level: item.level,
    message: item.message,
    evidence: item.evidence ? stringify(item.evidence) : "",
  })),
)}

## Required Tables

${markdownTable(tableState)}

## Required Columns

${markdownTable(columnState)}

## Migration History

${markdownTable(migrationHistory)}

## Tenants

${markdownTable(tenants)}

## Stores

${markdownTable(stores)}

## Domains

${markdownTable(domains)}

## Homepage Section Ownership Summary

${markdownTable(sectionSummary)}

## Unowned Homepage Sections

${markdownTable(unownedSections)}

## Unsafe Global Store Settings

${markdownTable(unsafeGlobalSettings)}

## Missing Scoped Store Settings

${markdownTable(missingScopedSettings)}

## Admin/Manager Scope

${markdownTable(adminUsers)}

## Unscoped Admin/Manager Users

${markdownTable(unscopedAdminUsers)}

## Orphan Stores

${markdownTable(orphanStores)}

## Invalid Domains

${markdownTable(invalidDomains)}

## Duplicate Primary Domains

${markdownTable(duplicatePrimaryDomains)}

## Stores Without Primary Domain

${markdownTable(storesWithoutPrimaryDomain)}
`;

  const mappingTemplate = {
    generatedFromAuditVersion: "2.1",
    instructions: [
      "Use exact existing IDs only.",
      "Do not assign ambiguous rows.",
      "Missing database columns must be resolved before row backfill.",
    ],
    tenants: tenants.map((row) => ({
      tenantId: row.id,
      name: row.name,
      slug: row.slug,
      action: "KEEP_OR_REVIEW",
    })),
    stores: stores.map((row) => ({
      storeId: row.id,
      storeName: row.name,
      currentTenantId: row.tenantId ?? null,
      targetTenantId: row.tenantId ?? "REQUIRED",
      primaryDomain: row.primaryDomain ?? "REQUIRED",
    })),
    domains: domains.map((row) => ({
      domainId: row.id,
      hostname: row.hostname,
      tenantId: row.tenantId,
      storeId: row.storeId,
      isPrimary: row.isPrimary,
    })),
    homepageSections: unownedSections.map((row) => ({
      sectionId: row.id,
      title: row.title,
      targetTenantId: row.tenantId ?? "REQUIRED",
      targetStoreId: row.storeId ?? "REQUIRED",
    })),
    users: unscopedAdminUsers.map((row) => ({
      userId: row.id,
      email: row.email,
      role: row.role,
      targetTenantId: row.tenantId ?? "REQUIRED",
      targetStoreId: row.storeId ?? "REQUIRED",
    })),
  };

  fs.writeFileSync(
    path.join(auditRoot, "PHASE_H3_FINAL_OWNERSHIP_AUDIT_V2_1.json"),
    stringify({
      summary,
      findings,
      tableState,
      columnState,
      migrationHistory,
      tenants,
      stores,
      domains,
      runtimeRows,
      sectionSummary,
      unownedSections,
      unsafeGlobalSettings,
      missingScopedSettings,
      adminUsers,
      unscopedAdminUsers,
      orphanStores,
      invalidDomains,
      duplicatePrimaryDomains,
      storesWithoutPrimaryDomain,
    }),
    "utf8",
  );

  fs.writeFileSync(
    path.join(auditRoot, "PHASE_H3_FINAL_OWNERSHIP_AUDIT_V2_1.md"),
    ownershipReport,
    "utf8",
  );

  fs.writeFileSync(
    path.join(auditRoot, "PHASE_H3_RUNTIME_OWNERSHIP_MATRIX_V2_1.md"),
    `# PHASE H3 RUNTIME OWNERSHIP MATRIX V2.1\n\n${markdownTable(runtimeRows)}`,
    "utf8",
  );

  fs.writeFileSync(
    path.join(auditRoot, "PHASE_H3_CROSS_TENANT_READINESS_V2_1.md"),
    `# PHASE H3 CROSS-TENANT READINESS V2.1

Status: **${status}**

${blockers.length
  ? blockers.map((item) => `- ${item}`).join("\n")
  : "- Ready for cross-tenant certification."}
`,
    "utf8",
  );

  fs.writeFileSync(
    path.join(auditRoot, "H3_BACKFILL_MAPPING_TEMPLATE_V2_1.json"),
    stringify(mappingTemplate),
    "utf8",
  );

  fs.writeFileSync(
    path.join(auditRoot, "H3_FINAL_SUMMARY_V2_1.md"),
    `# H3 Final Summary V2.1

Status: **${status}**

${blockers.length
  ? blockers.map((item) => `- ${item}`).join("\n")
  : "- Ownership checks passed."}
`,
    "utf8",
  );

  console.log("H3 Final Ownership Audit v2.1 completed.");
  console.log(`Output: ${auditRoot}`);
  console.log(`Status: ${status}`);
  console.log(`Blockers: ${blockers.length}`);

  process.exitCode = blockers.length ? 2 : 0;
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
