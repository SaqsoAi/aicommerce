import fs from "node:fs";
import path from "node:path";
import prisma from "../src/config/prisma";

type Mapping = {
  homepageSections?: Array<{
    sectionId: string;
    tenantId: string;
    storeId: string;
  }>;
  storeSettings?: Array<{
    existingSettingId: string;
    storeId: string;
  }>;
  users?: Array<{
    userId: string;
    tenantId: string;
    storeId: string;
  }>;
};

function required(value: unknown, label: string): string {
  const text = String(value || "").trim();

  if (!text || /REQUIRED|PLACEHOLDER|EXACT_/i.test(text)) {
    throw new Error(`${label} is missing or still contains a placeholder`);
  }

  return text;
}

async function validateStoreOwnership(
  tenantId: string,
  storeId: string,
): Promise<void> {
  const store = await prisma.store.findFirst({
    where: { id: storeId, tenantId },
    select: { id: true },
  });

  if (!store) {
    throw new Error(
      `Store ${storeId} does not belong to Tenant ${tenantId}`,
    );
  }
}

async function main(): Promise<void> {
  const mappingPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve(
        process.cwd(),
        "..",
        "PROJECT_AUDIT",
        "H3_FINAL_OWNERSHIP_AUDIT_V2_1",
        "H3_BACKFILL_MAPPING_APPROVED.json",
      );

  const apply = process.argv.includes("--apply");

  if (!fs.existsSync(mappingPath)) {
    throw new Error(`Approved mapping file not found: ${mappingPath}`);
  }

  const mapping = JSON.parse(
    fs.readFileSync(mappingPath, "utf8"),
  ) as Mapping;

  const sections = mapping.homepageSections || [];
  const settings = mapping.storeSettings || [];
  const users = mapping.users || [];

  for (const item of sections) {
    const sectionId = required(item.sectionId, "sectionId");
    const tenantId = required(item.tenantId, "tenantId");
    const storeId = required(item.storeId, "storeId");

    await validateStoreOwnership(tenantId, storeId);

    const section = await prisma.homepageSection.findUnique({
      where: { id: sectionId },
      select: { id: true, tenantId: true, storeId: true },
    });

    if (!section) throw new Error(`HomepageSection not found: ${sectionId}`);

    if (
      (section.tenantId && section.tenantId !== tenantId) ||
      (section.storeId && section.storeId !== storeId)
    ) {
      throw new Error(
        `HomepageSection ${sectionId} already has conflicting ownership`,
      );
    }
  }

  for (const item of settings) {
    const settingId = required(item.existingSettingId, "existingSettingId");
    const storeId = required(item.storeId, "storeId");

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    });

    if (!store) throw new Error(`Store not found: ${storeId}`);

    const setting = await prisma.storeSetting.findUnique({
      where: { id: settingId },
      select: { id: true, singletonKey: true },
    });

    if (!setting) throw new Error(`StoreSetting not found: ${settingId}`);

    const targetKey = `store:${storeId}`;
    const conflicting = await prisma.storeSetting.findUnique({
      where: { singletonKey: targetKey },
      select: { id: true },
    });

    if (conflicting && conflicting.id !== settingId) {
      throw new Error(
        `Target StoreSetting key already belongs to ${conflicting.id}`,
      );
    }
  }

  for (const item of users) {
    const userId = required(item.userId, "userId");
    const tenantId = required(item.tenantId, "tenantId");
    const storeId = required(item.storeId, "storeId");

    await validateStoreOwnership(tenantId, storeId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, tenantId: true, storeId: true },
    });

    if (!user) throw new Error(`User not found: ${userId}`);

    if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(String(user.role))) {
      throw new Error(`User ${userId} is not an administrative role`);
    }

    if (
      (user.tenantId && user.tenantId !== tenantId) ||
      (user.storeId && user.storeId !== storeId)
    ) {
      throw new Error(`User ${userId} already has conflicting ownership`);
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "APPLY" : "DRY_RUN",
        homepageSections: sections.length,
        storeSettings: settings.length,
        users: users.length,
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log("Validation passed. Re-run with --apply to commit.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const item of sections) {
      await tx.homepageSection.update({
        where: { id: item.sectionId },
        data: {
          tenantId: item.tenantId,
          storeId: item.storeId,
        },
      });
    }

    for (const item of settings) {
      await tx.storeSetting.update({
        where: { id: item.existingSettingId },
        data: {
          singletonKey: `store:${item.storeId}`,
        },
      });
    }

    for (const item of users) {
      await tx.user.update({
        where: { id: item.userId },
        data: {
          tenantId: item.tenantId,
          storeId: item.storeId,
        },
      });
    }
  });

  console.log("H3 deterministic ownership backfill committed.");
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
