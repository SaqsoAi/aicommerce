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
  const rows = await raw(
    `SELECT to_regclass('"${table.replace(/"/g, "")}"')::text AS value`,
  );
  return Boolean(rows[0]?.value);
}

async function columnExists(
  table: string,
  column: string,
): Promise<boolean> {
  const rows = await raw(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = '${table.replace(/'/g, "''")}'
        AND column_name = '${column.replace(/'/g, "''")}'
    ) AS value
  `);
  return Boolean(rows[0]?.value);
}

function markdownTable(rows: Row[]): string {
  if (!rows.length) return "_No rows found._\n";

  const keys = Object.keys(rows[0]);
  const head = `| ${keys.join(" | ")} |`;
  const rule = `| ${keys.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) =>
    `| ${keys
      .map((key) =>
        String(row[key] ?? "")
          .replace(/\r?\n/g, " ")
          .replace(/\|/g, "\\|"),
      )
      .join(" | ")} |`
  );

  return [head, rule, ...body].join("\n") + "\n";
}

function sourceContains(file: string, text: string): boolean {
  if (!fs.existsSync(file)) return false;
  return fs.readFileSync(file, "utf8").includes(text);
}

function countOccurrences(file: string, text: string): number {
  if (!fs.existsSync(file)) return 0;
  const body = fs.readFileSync(file, "utf8");
  return body.split(text).length - 1;
}

async function main(): Promise<void> {
  const projectRoot = path.resolve(process.argv[2] || "D:\\AI-ECOMMERCE");
  const auditRoot = path.resolve(
    process.argv[3] ||
      path.join(projectRoot, "PROJECT_AUDIT", "H3_FINAL_OWNERSHIP_AUDIT_V2"),
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
    homepageRoutes: path.join(
      serverRoot,
      "src",
      "modules",
      "homepage-section",
      "homepage-section.routes.ts",
    ),
    clientRuntime: path.join(
      clientRoot,
      "src",
      "lib",
      "homepage-runtime.ts",
    ),
    orchestrator: path.join(
      clientRoot,
      "src",
      "components",
      "homepage",
      "HomepageRuntimeOrchestrator.tsx",
    ),
  };

  const findings: Finding[] = [];

  const requiredSourceFiles = Object.entries(files);
  for (const [key, file] of requiredSourceFiles) {
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
      sourceContains(
        files.app,
        'app.use("/api/storefront", storefrontRuntimeRoutes);',
      ) &&
      sourceContains(
        files.app,
        'import storefrontRuntimeRoutes from "./modules/storefront-runtime/storefront-runtime.routes";',
      )
        ? "PASS"
        : "BLOCKED",
    message:
      "Canonical /api/storefront route import and registration must exist exactly once.",
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
      "Public homepage section query must include both tenantId and storeId.",
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
      "Admin homepage mutations must ownership-check IDs and reject foreign reorder IDs.",
  });

  findings.push({
    key: "source.client.global.api.removed",
    level:
      !sourceContains(files.clientRuntime, "/enterprise-settings") &&
      !sourceContains(files.clientRuntime, "/homepage-sections/active") &&
      sourceContains(files.clientRuntime, "/storefront/runtime")
        ? "PASS"
        : "BLOCKED",
    message:
      "Client runtime must use only the scoped storefront runtime endpoint.",
  });

  findings.push({
    key: "source.preview.fail.closed",
    level:
      sourceContains(files.clientRuntime, 'context.mode === "preview"') &&
      sourceContains(
        files.clientRuntime,
        "authorized revision service is implemented",
      )
        ? "PASS"
        : "WARN",
    message:
      "Preview must remain fail-closed until H13 authorization exists.",
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

  const tableState: Row[] = [];
  for (const table of tableNames) {
    tableState.push({
      table,
      exists: await tableExists(table),
    });
  }

  const tenantExists = await tableExists("Tenant");
  const storeExists = await tableExists("Store");
  const domainExists = await tableExists("StorefrontDomain");
  const sectionExists = await tableExists("HomepageSection");
  const settingExists = await tableExists("StoreSetting");
  const userExists = await tableExists("User");

  const requiredColumns: Array<[string, string]> = [
    ["Store", "tenantId"],
    ["Store", "status"],
    ["Store", "storefrontEnabled"],
    ["Store", "primaryDomain"],
    ["HomepageSection", "tenantId"],
    ["HomepageSection", "storeId"],
  ];

  const columnState: Row[] = [];
  for (const [table, column] of requiredColumns) {
    columnState.push({
      table,
      column,
      exists: await columnExists(table, column),
    });
  }

  const tenants = tenantExists
    ? await raw(`
        SELECT
          "id",
          "name",
          "slug",
          "status",
          "storefrontEnabled",
          "createdAt",
          "updatedAt"
        FROM "Tenant"
        ORDER BY "createdAt", "id"
      `)
    : [];

  const stores = storeExists
    ? await raw(`
        SELECT
          "id",
          "name",
          "tenantId",
          "status",
          "storefrontEnabled",
          "primaryDomain",
          "createdAt",
          "updatedAt"
        FROM "Store"
        ORDER BY "createdAt", "id"
      `)
    : [];

  const domains = domainExists
    ? await raw(`
        SELECT
          "id",
          "hostname",
          "status",
          "isPrimary",
          "tenantId",
          "storeId",
          "createdAt",
          "updatedAt"
        FROM "StorefrontDomain"
        ORDER BY "hostname"
      `)
    : [];

  const sectionSummary = sectionExists
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

  const unownedSections = sectionExists
    ? await raw(`
        SELECT
          "id",
          "title",
          "slug",
          "type",
          "enabled",
          "sortOrder",
          "tenantId",
          "storeId"
        FROM "HomepageSection"
        WHERE "tenantId" IS NULL OR "storeId" IS NULL
        ORDER BY "sortOrder", "id"
      `)
    : [];

  const orphanStores = tenantExists && storeExists
    ? await raw(`
        SELECT
          s."id",
          s."name",
          s."tenantId",
          s."status",
          s."storefrontEnabled"
        FROM "Store" s
        LEFT JOIN "Tenant" t ON t."id" = s."tenantId"
        WHERE s."tenantId" IS NULL OR t."id" IS NULL
        ORDER BY s."name", s."id"
      `)
    : [];

  const invalidDomains = tenantExists && storeExists && domainExists
    ? await raw(`
        SELECT
          d."id",
          d."hostname",
          d."tenantId",
          d."storeId",
          d."status",
          d."isPrimary",
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

  const duplicatePrimaryDomains = domainExists
    ? await raw(`
        SELECT
          "storeId",
          COUNT(*)::text AS "primaryCount"
        FROM "StorefrontDomain"
        WHERE "isPrimary" = true
        GROUP BY "storeId"
        HAVING COUNT(*) > 1
      `)
    : [];

  const storesWithoutPrimaryDomain = storeExists && domainExists
    ? await raw(`
        SELECT
          s."id",
          s."name",
          s."tenantId",
          s."primaryDomain"
        FROM "Store" s
        LEFT JOIN "StorefrontDomain" d
          ON d."storeId" = s."id"
         AND d."isPrimary" = true
        WHERE d."id" IS NULL
        ORDER BY s."name", s."id"
      `)
    : [];

  const unsafeGlobalSettings = settingExists
    ? await raw(`
        SELECT
          "id",
          "singletonKey",
          "storeName",
          "activeTemplate"
        FROM "StoreSetting"
        WHERE "singletonKey" NOT LIKE 'store:%'
        ORDER BY "singletonKey"
      `)
    : [];

  const missingScopedSettings = storeExists && settingExists
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

  const userHasTenantId = userExists
    ? await columnExists("User", "tenantId")
    : false;
  const userHasStoreId = userExists
    ? await columnExists("User", "storeId")
    : false;

  const adminUsers =
    userExists && userHasTenantId && userHasStoreId
      ? await raw(`
          SELECT
            "id",
            "email",
            "role",
            "tenantId",
            "storeId"
          FROM "User"
          WHERE "role" IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
          ORDER BY "role", "email"
        `)
      : [];

  const unscopedAdminUsers =
    userExists && userHasTenantId && userHasStoreId
      ? await raw(`
          SELECT
            "id",
            "email",
            "role",
            "tenantId",
            "storeId"
          FROM "User"
          WHERE "role" IN ('ADMIN', 'MANAGER')
            AND ("tenantId" IS NULL OR "storeId" IS NULL)
          ORDER BY "role", "email"
        `)
      : [];

  const migrationHistory = await tableExists("_prisma_migrations")
    ? await raw(`
        SELECT
          migration_name AS "migrationName",
          finished_at AS "finishedAt",
          rolled_back_at AS "rolledBackAt",
          logs
        FROM "_prisma_migrations"
        WHERE migration_name = '20260713010000_homepage_tenant_store_isolation'
        ORDER BY started_at DESC
      `)
    : [];

  const runtimeRows = domainExists && tenantExists && storeExists
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
          d."hostname",
          d."status",
          d."isPrimary",
          t."id",
          t."slug",
          t."status",
          t."storefrontEnabled",
          s."id",
          s."name",
          s."status",
          s."storefrontEnabled"
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
      "H3 migration is not recorded in _prisma_migrations.",
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
      `${storesWithoutPrimaryDomain.length} Store row(s) have no primary StorefrontDomain.`,
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
      `${missingScopedSettings.length} Store row(s) have no store:<storeId> StoreSetting.`,
    );
  }

  if (!userHasTenantId || !userHasStoreId) {
    blockers.push(
      "User table does not contain both tenantId and storeId columns.",
    );
  } else if (unscopedAdminUsers.length) {
    blockers.push(
      `${unscopedAdminUsers.length} ADMIN/MANAGER user(s) have incomplete tenant/store scope.`,
    );
  }

  const sourceBlockers = findings.filter(
    (finding) => finding.level === "BLOCKED" || finding.level === "FAIL",
  );

  for (const finding of sourceBlockers) {
    blockers.push(`${finding.key}: ${finding.message}`);
  }

  const readyForIsolation =
    blockers.length === 0 &&
    tenants.length >= 2 &&
    stores.length >= 2 &&
    domains.length >= 2;

  if (blockers.length === 0 && !readyForIsolation) {
    blockers.push(
      "Ownership is clean, but at least two Tenant/Store/Domain fixtures are required for cross-tenant certification.",
    );
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    projectRoot,
    status:
      blockers.length === 0
        ? "READY_FOR_CROSS_TENANT_CERTIFICATION"
        : "BACKFILL_OR_FIX_REQUIRED",
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

  const runtimeMatrix = `# PHASE H3 RUNTIME OWNERSHIP MATRIX

${markdownTable(runtimeRows)}

## Interpretation

A runtime row is eligible only when Domain, Tenant and Store are active, storefront flags are enabled, and the scoped Store has its own HomepageSection and StoreSetting data.
`;

  const crossTenantReport = `# PHASE H3 CROSS-TENANT READINESS REPORT

## Status

**${readyForIsolation ? "READY" : "NOT READY"}**

## Requirements

- At least two valid Tenant records
- At least two valid Store records
- At least two valid StorefrontDomain records
- No orphan Store
- No invalid Domain ownership
- No unowned HomepageSection
- One store-scoped StoreSetting per Store
- ADMIN/MANAGER users scoped to tenantId and storeId
- H3 migration recorded successfully

## Current Blockers

${blockers.length
  ? blockers.map((item) => `- ${item}`).join("\n")
  : "- None"}
`;

  const ownershipReport = `# PHASE H3 FINAL OWNERSHIP AUDIT V2

Generated: ${summary.generatedAt}

## Status

**${summary.status}**

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

## Storefront Domains

${markdownTable(domains)}

## Homepage Section Ownership Summary

${markdownTable(sectionSummary)}

## Unowned Homepage Sections

${markdownTable(unownedSections)}

## Store Settings Requiring Conversion

${markdownTable(unsafeGlobalSettings)}

## Stores Missing Scoped Settings

${markdownTable(missingScopedSettings)}

## Admin and Manager Scope

${markdownTable(adminUsers)}

## Unscoped Admin and Manager Users

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
    generatedFromAudit: true,
    instructions: [
      "Use only existing IDs from the audit output.",
      "Do not assign ambiguous rows.",
      "Review every mapping before executing a backfill.",
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
      currentTenantId: row.tenantId,
      targetTenantId: row.tenantId || "REQUIRED",
      primaryDomain: row.primaryDomain || "REQUIRED",
      status: row.status,
      storefrontEnabled: row.storefrontEnabled,
    })),
    domains: domains.map((row) => ({
      domainId: row.id,
      hostname: row.hostname,
      tenantId: row.tenantId,
      storeId: row.storeId,
      status: row.status,
      isPrimary: row.isPrimary,
    })),
    homepageSections: unownedSections.map((row) => ({
      sectionId: row.id,
      title: row.title,
      slug: row.slug,
      targetTenantId: row.tenantId || "REQUIRED",
      targetStoreId: row.storeId || "REQUIRED",
    })),
    storeSettings: [
      ...unsafeGlobalSettings.map((row) => ({
        existingSettingId: row.id,
        currentSingletonKey: row.singletonKey,
        targetStoreId: "REQUIRED",
        targetSingletonKey: "store:REQUIRED_STORE_ID",
      })),
      ...missingScopedSettings.map((row) => ({
        existingSettingId: null,
        currentSingletonKey: null,
        targetStoreId: row.storeId,
        targetSingletonKey: row.requiredKey,
      })),
    ],
    users: unscopedAdminUsers.map((row) => ({
      userId: row.id,
      email: row.email,
      role: row.role,
      targetTenantId: row.tenantId || "REQUIRED",
      targetStoreId: row.storeId || "REQUIRED",
    })),
  };

  fs.writeFileSync(
    path.join(auditRoot, "PHASE_H3_FINAL_OWNERSHIP_AUDIT_V2.json"),
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
    path.join(auditRoot, "PHASE_H3_FINAL_OWNERSHIP_AUDIT_V2.md"),
    ownershipReport,
    "utf8",
  );

  fs.writeFileSync(
    path.join(auditRoot, "PHASE_H3_RUNTIME_OWNERSHIP_MATRIX.md"),
    runtimeMatrix,
    "utf8",
  );

  fs.writeFileSync(
    path.join(auditRoot, "PHASE_H3_CROSS_TENANT_READINESS_REPORT.md"),
    crossTenantReport,
    "utf8",
  );

  fs.writeFileSync(
    path.join(auditRoot, "H3_BACKFILL_MAPPING_TEMPLATE_V2.json"),
    stringify(mappingTemplate),
    "utf8",
  );

  fs.writeFileSync(
    path.join(auditRoot, "H3_FINAL_SUMMARY.md"),
    `# H3 Final Summary

Status: **${summary.status}**

${blockers.length
  ? blockers.map((item) => `- ${item}`).join("\n")
  : "- Ownership and source checks passed."}
`,
    "utf8",
  );

  console.log(`H3 Final Ownership Audit v2 completed.`);
  console.log(`Output: ${auditRoot}`);
  console.log(`Status: ${summary.status}`);
  console.log(`Blockers: ${blockers.length}`);

  process.exitCode = blockers.length ? 2 : 0;
}

main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.stack || error.message
        : String(error);

    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
