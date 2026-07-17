import crypto from "crypto";
import prisma from "../../config/prisma";

export type HomepageOwnershipScope = {
  tenantId: string;
  storeId: string;
};

const scopeWhere = (scope: HomepageOwnershipScope) => ({
  tenantId: scope.tenantId,
  storeId: scope.storeId,
});

async function assertOwned(
  scope: HomepageOwnershipScope,
  id: string,
): Promise<void> {
  const record = await prisma.homepageSection.findFirst({
    where: { id, ...scopeWhere(scope) },
    select: { id: true },
  });

  if (!record) {
    throw Object.assign(new Error("Homepage section not found"), {
      statusCode: 404,
    });
  }
}

export async function getHomepageSectionsService(
  scope: HomepageOwnershipScope,
) {
  return prisma.homepageSection.findMany({
    where: scopeWhere(scope),
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

export async function createHomepageSectionService(
  scope: HomepageOwnershipScope,
  data: {
    title: string;
    slug: string;
    type: string;
    enabled?: boolean;
    sortOrder?: number;
    data?: unknown;
  },
) {
  return prisma.homepageSection.create({
    data: {
      id: crypto.randomUUID(),
      tenantId: scope.tenantId,
      storeId: scope.storeId,
      title: data.title,
      slug: data.slug,
      type: data.type,
      enabled: data.enabled ?? true,
      sortOrder: data.sortOrder ?? 0,
      data: (data.data ?? {}) as object,
      updatedAt: new Date(),
    },
  });
}

export async function updateHomepageSectionService(
  scope: HomepageOwnershipScope,
  id: string,
  data: {
    title?: string;
    slug?: string;
    type?: string;
    enabled?: boolean;
    sortOrder?: number;
    data?: unknown;
  },
) {
  await assertOwned(scope, id);

  return prisma.homepageSection.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      type: data.type,
      enabled: data.enabled,
      sortOrder: data.sortOrder,
      data: data.data === undefined ? undefined : (data.data as object),
    },
  });
}

export async function deleteHomepageSectionService(
  scope: HomepageOwnershipScope,
  id: string,
) {
  await assertOwned(scope, id);
  return prisma.homepageSection.delete({ where: { id } });
}

export async function reorderHomepageSectionsService(
  scope: HomepageOwnershipScope,
  items: { id: string; sortOrder: number }[],
) {
  const ids = items.map((item) => item.id);

  const owned = await prisma.homepageSection.findMany({
    where: { id: { in: ids }, ...scopeWhere(scope) },
    select: { id: true },
  });

  if (owned.length !== ids.length) {
    throw Object.assign(
      new Error("One or more homepage sections are outside the current store"),
      { statusCode: 403 },
    );
  }

  await prisma.$transaction(
    items.map((item) =>
      prisma.homepageSection.update({
        where: { id: item.id },
        data: { sortOrder: Number(item.sortOrder) },
      }),
    ),
  );

  return getHomepageSectionsService(scope);
}

export async function toggleHomepageSectionService(
  scope: HomepageOwnershipScope,
  id: string,
  enabled: boolean,
) {
  await assertOwned(scope, id);

  return prisma.homepageSection.update({
    where: { id },
    data: { enabled },
  });
}
