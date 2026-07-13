import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import prisma from "../src/config/prisma";

type Config = {
  approved: boolean;
  hostname: string;
  tenantSlug?: string;
  storeSlug?: string;
  includeRoles?: string[];
};

type Discovery = {
  tenants: number;
  stores: number;
  domains: number;
  globalSettings: Array<{
    id: string;
    singletonKey: string;
    storeName: string;
    activeTemplate: string;
  }>;
  unownedSections: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  unscopedUsers: Array<{
    id: string;
    email: string;
    role: string;
  }>;
};

function slugify(value: string, fallback: string): string {
  const result = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return result || fallback;
}

function normalizeHostname(value: string): string {
  const hostname = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");

  if (
    !hostname ||
    !/^(localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63})$/i.test(
      hostname,
    )
  ) {
    throw new Error(`Invalid approved hostname: ${value}`);
  }

  return hostname;
}

async function discover(includeRoles: string[]): Promise<Discovery> {
  const [tenants, stores, domains, globalSettings, unownedSections, users] =
    await Promise.all([
      prisma.tenant.count(),
      prisma.store.count(),
      prisma.storefrontDomain.count(),
      prisma.storeSetting.findMany({
        where: { NOT: { singletonKey: { startsWith: "store:" } } },
        select: {
          id: true,
          singletonKey: true,
          storeName: true,
          activeTemplate: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.homepageSection.findMany({
        where: {
          OR: [{ tenantId: null }, { storeId: null }],
        },
        select: { id: true, title: true, slug: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      }),
      prisma.user.findMany({
        where: {
          role: { in: includeRoles as never[] },
          OR: [{ tenantId: null }, { storeId: null }],
        },
        select: { id: true, email: true, role: true },
        orderBy: [{ role: "asc" }, { email: "asc" }],
      }),
    ]);

  return {
    tenants,
    stores,
    domains,
    globalSettings,
    unownedSections,
    unscopedUsers: users.map((user) => ({
      id: user.id,
      email: user.email,
      role: String(user.role),
    })),
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const configArg = args.find((arg) => !arg.startsWith("--"));

  const configPath = path.resolve(
    configArg ||
      path.join(
        process.cwd(),
        "..",
        "PROJECT_AUDIT",
        "H3_1_AUTOMATIC_OWNERSHIP",
        "H3_1_APPROVED_BOOTSTRAP_CONFIG.json",
      ),
  );

  if (!fs.existsSync(configPath)) {
    throw new Error(`Approved config not found: ${configPath}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as Config;
  const includeRoles = config.includeRoles || ["ADMIN", "MANAGER"];
  const discovery = await discover(includeRoles);

  const blockers: string[] = [];

  if (discovery.tenants > 1 || discovery.stores > 1 || discovery.domains > 1) {
    blockers.push(
      "Multiple Tenant/Store/Domain records exist. Automatic single-store bootstrap is not safe.",
    );
  }

  if (discovery.tenants === 0 || discovery.stores === 0) {
    if (discovery.globalSettings.length !== 1) {
      blockers.push(
        `Bootstrap requires exactly one global StoreSetting; found ${discovery.globalSettings.length}.`,
      );
    }
  }

  const hostname = normalizeHostname(config.hostname);
  const globalSetting = discovery.globalSettings[0];
  const identityName = globalSetting?.storeName || "AI Commerce";
  const tenantSlug = slugify(
    config.tenantSlug || identityName,
    "primary-tenant",
  );
  const storeSlug = slugify(config.storeSlug || identityName, "primary-store");

  const plan = {
    mode: apply ? "APPLY" : "DRY_RUN",
    approved: Boolean(config.approved),
    discovery,
    proposed: {
      hostname,
      identityName,
      tenantSlug,
      storeSlug,
      createTenant: discovery.tenants === 0,
      createStore: discovery.stores === 0,
      createDomain: discovery.domains === 0,
      convertGlobalSetting: discovery.globalSettings.length === 1,
      assignSections: discovery.unownedSections.length,
      assignUsers: discovery.unscopedUsers.length,
    },
    blockers,
  };

  console.log(JSON.stringify(plan, null, 2));

  if (blockers.length) {
    throw new Error(`Discovery blocked: ${blockers.join(" ")}`);
  }

  if (!apply) {
    console.log(
      "Dry-run PASS. Review the plan, set approved=true, then rerun with --apply.",
    );
    return;
  }

  if (!config.approved) {
    throw new Error("Config approved must be true before --apply.");
  }

  const result = await prisma.$transaction(async (tx) => {
    let tenant = await tx.tenant.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!tenant) {
      tenant = await tx.tenant.create({
        data: {
          id: crypto.randomUUID(),
          name: identityName,
          slug: tenantSlug,
          status: "ACTIVE",
          storefrontEnabled: true,
          updatedAt: new Date(),
        },
      });
    }

    let store = await tx.store.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!store) {
      store = await tx.store.create({
        data: {
          id: crypto.randomUUID(),
          name: identityName,
          tenantId: tenant.id,
          status: "ACTIVE",
          storefrontEnabled: true,
          primaryDomain: hostname,
        },
      });
    } else {
      if (store.tenantId && store.tenantId !== tenant.id) {
        throw new Error("Existing Store belongs to a different Tenant.");
      }

      store = await tx.store.update({
        where: { id: store.id },
        data: {
          tenantId: tenant.id,
          status: "ACTIVE",
          storefrontEnabled: true,
          primaryDomain: store.primaryDomain || hostname,
        },
      });
    }

    let domain = await tx.storefrontDomain.findUnique({
      where: { hostname },
    });

    if (domain) {
      if (domain.tenantId !== tenant.id || domain.storeId !== store.id) {
        throw new Error(
          "Approved hostname is already owned by a different Tenant/Store.",
        );
      }
    } else {
      domain = await tx.storefrontDomain.create({
        data: {
          id: crypto.randomUUID(),
          hostname,
          tenantId: tenant.id,
          storeId: store.id,
          status: "ACTIVE",
          isPrimary: true,
          updatedAt: new Date(),
        },
      });
    }

    await tx.storefrontDomain.updateMany({
      where: {
        storeId: store.id,
        id: { not: domain.id },
      },
      data: { isPrimary: false },
    });

    if (globalSetting) {
      const targetKey = `store:${store.id}`;
      const conflict = await tx.storeSetting.findUnique({
        where: { singletonKey: targetKey },
      });

      if (conflict && conflict.id !== globalSetting.id) {
        throw new Error(
          `StoreSetting key ${targetKey} already belongs to ${conflict.id}.`,
        );
      }

      await tx.storeSetting.update({
        where: { id: globalSetting.id },
        data: { singletonKey: targetKey },
      });
    }

    const sectionResult = await tx.homepageSection.updateMany({
      where: {
        OR: [{ tenantId: null }, { storeId: null }],
      },
      data: {
        tenantId: tenant.id,
        storeId: store.id,
      },
    });

    const userResult = await tx.user.updateMany({
      where: {
        role: { in: includeRoles as never[] },
        OR: [{ tenantId: null }, { storeId: null }],
      },
      data: {
        tenantId: tenant.id,
        storeId: store.id,
      },
    });

    return {
      tenantId: tenant.id,
      storeId: store.id,
      domainId: domain.id,
      hostname,
      sectionsUpdated: sectionResult.count,
      usersUpdated: userResult.count,
      settingConverted: Boolean(globalSetting),
    };
  });

  console.log(
    JSON.stringify(
      {
        status: "COMMITTED",
        ...result,
      },
      null,
      2,
    ),
  );
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
