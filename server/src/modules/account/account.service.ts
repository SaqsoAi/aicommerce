import { PrismaClient } from "@prisma/client";

import type { AccountDashboard } from "./account.types";

const prisma = new PrismaClient();

type AnyRecord = Record<string, any>;

function safeJson(value: unknown, fallback: unknown) {
  if (!value || typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function tableExists(tableName: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `select exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = $1) as exists`,
    tableName,
  );
  return Boolean(rows?.[0]?.exists);
}

async function firstRow(tableName: string, orderBy = "createdAt"): Promise<AnyRecord | null> {
  if (!(await tableExists(tableName))) return null;
  const rows = await prisma.$queryRawUnsafe<AnyRecord[]>(`select * from "${tableName}" order by "${orderBy}" desc limit 1`);
  return rows?.[0] || null;
}

async function rowsByUser(tableName: string, userId: string, limit = 20): Promise<AnyRecord[]> {
  if (!(await tableExists(tableName))) return [];
  const rows = await prisma.$queryRawUnsafe<AnyRecord[]>(`select * from "${tableName}" where "userId" = $1 order by "createdAt" desc limit ${limit}`, userId);
  return rows || [];
}

async function rowsByAny(tableName: string, limit = 20): Promise<AnyRecord[]> {
  if (!(await tableExists(tableName))) return [];
  const rows = await prisma.$queryRawUnsafe<AnyRecord[]>(`select * from "${tableName}" order by "createdAt" desc limit ${limit}`);
  return rows || [];
}

async function resolveUser(userId?: string | null): Promise<AnyRecord | null> {
  if (userId && (await tableExists("User"))) {
    const rows = await prisma.$queryRawUnsafe<AnyRecord[]>(`select * from "User" where "id" = $1 limit 1`, userId);
    if (rows?.[0]) return rows[0];
  }
  return firstRow("User", "createdAt");
}

function buildDefaultActions(wishlistCount: number, orderCount: number, rewardBalance: number) {
  return [
    { key: "orders", title: "Track Orders", subtitle: `${orderCount} recent orders`, href: "/orders", icon: "package" },
    { key: "wishlist", title: "My Wishlist", subtitle: `${wishlistCount} saved items`, href: "/wishlist", icon: "heart", count: wishlistCount },
    { key: "size-guide", title: "Size Guide", subtitle: "Find perfect fit", href: "/size-guide", icon: "ruler" },
    { key: "style-quiz", title: "Style Quiz", subtitle: "Update preferences", href: "/account?tab=style", icon: "sparkles" },
    { key: "rewards", title: "My Rewards", subtitle: `${rewardBalance} points`, href: "/dashboard/rewards", icon: "gift" },
    { key: "help", title: "Get Help", subtitle: "24/7 support", href: "/communication-center", icon: "help" },
  ];
}

export async function getAccountDashboard(userId?: string | null): Promise<AccountDashboard> {
  const user = await resolveUser(userId);
  const resolvedUserId = String(user?.id || userId || "");

  const hasAccountTables = await tableExists("AccountProfile");
  const profileRows = resolvedUserId ? await rowsByUser("AccountProfile", resolvedUserId, 1) : [];
  const membershipRows = resolvedUserId ? await rowsByUser("AccountMembership", resolvedUserId, 1) : [];
  const rewardRows = resolvedUserId ? await rowsByUser("AccountRewardLedger", resolvedUserId, 20) : [];
  const addressRows = resolvedUserId ? await rowsByUser("AccountAddress", resolvedUserId, 10) : [];

  const profile = profileRows[0] || {
    userId: resolvedUserId || null,
    displayName: user?.name || user?.email || "Customer",
    avatarUrl: null,
    phone: user?.phone || null,
    joinedAt: user?.createdAt || null,
    addresses: addressRows,
  };

  const rewardBalance = rewardRows.reduce((sum, row) => sum + Number(row.points || 0), 0);
  const membership = membershipRows[0] || {
    tier: rewardBalance >= 2000 ? "Gold" : rewardBalance >= 500 ? "Silver" : "Bronze",
    stylePoints: rewardBalance,
    status: "ACTIVE",
  };

  const recentOrders = await rowsByAny("Order", 5);
  const wishlist = await rowsByAny("Wishlist", 12);
  const recommendations = await rowsByAny("Product", 8);

  const widgets = [
    { key: "stylePoints", title: "Style Points", value: Number(membership.stylePoints || rewardBalance || 0), subtitle: "Available reward points", href: "/dashboard/rewards" },
    { key: "membership", title: "Member Tier", value: String(membership.tier || "Bronze"), subtitle: "Current membership tier", href: "/membership" },
    { key: "orders", title: "Recent Orders", value: recentOrders.length, subtitle: "Latest order activity", href: "/orders" },
    { key: "wishlist", title: "Wishlist", value: wishlist.length, subtitle: "Saved fashion picks", href: "/wishlist" },
  ];

  return {
    profile: {
      ...profile,
      sizes: safeJson(profile.sizesJson, {}),
      colors: safeJson(profile.colorsJson, []),
    },
    membership,
    rewards: {
      balance: rewardBalance,
      ledger: rewardRows,
    },
    widgets,
    quickActions: buildDefaultActions(wishlist.length, recentOrders.length, rewardBalance),
    recentOrders,
    wishlist,
    recommendations,
    dbReady: hasAccountTables,
  };
}

export async function getAccountProfile(userId?: string | null) {
  const dashboard = await getAccountDashboard(userId);
  return dashboard.profile;
}

export async function updateAccountProfile(userId: string | null | undefined, body: AnyRecord) {
  const resolved = userId || body.userId;
  if (!resolved) {
    return { success: false, message: "Missing userId. Login context or userId is required." };
  }
  if (!(await tableExists("AccountProfile"))) {
    return { success: false, message: "AccountProfile table is not migrated yet." };
  }

  const existing = await rowsByUser("AccountProfile", String(resolved), 1);
  if (existing[0]) {
    await prisma.$executeRawUnsafe(
      `update "AccountProfile" set "displayName" = $1, "avatarUrl" = $2, "phone" = $3, "updatedAt" = now() where "userId" = $4`,
      body.displayName || null,
      body.avatarUrl || null,
      body.phone || null,
      String(resolved),
    );
  } else {
    await prisma.$executeRawUnsafe(
      `insert into "AccountProfile" ("id", "userId", "displayName", "avatarUrl", "phone", "createdAt", "updatedAt", "joinedAt") values (gen_random_uuid()::text, $1, $2, $3, $4, now(), now(), now())`,
      String(resolved),
      body.displayName || null,
      body.avatarUrl || null,
      body.phone || null,
    );
  }
  return getAccountProfile(String(resolved));
}

export async function getAccountAddresses(userId?: string | null) {
  if (!userId) return [];
  return rowsByUser("AccountAddress", userId, 50);
}

export async function createAccountAddress(userId: string | null | undefined, body: AnyRecord) {
  const resolved = userId || body.userId;
  if (!resolved) return { success: false, message: "Missing userId." };
  if (!(await tableExists("AccountAddress"))) return { success: false, message: "AccountAddress table is not migrated yet." };
  await prisma.$executeRawUnsafe(
    `insert into "AccountAddress" ("id", "userId", "label", "fullName", "phone", "line1", "line2", "city", "state", "postalCode", "country", "isDefault", "createdAt", "updatedAt") values (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), now())`,
    String(resolved),
    body.label || "Home",
    body.fullName || null,
    body.phone || null,
    body.line1 || body.address || "",
    body.line2 || null,
    body.city || null,
    body.state || null,
    body.postalCode || null,
    body.country || "Bangladesh",
    Boolean(body.isDefault),
  );
  return getAccountAddresses(String(resolved));
}

export async function getAccountOrders() {
  return rowsByAny("Order", 20);
}

export async function getAccountWishlist() {
  return rowsByAny("Wishlist", 50);
}

export async function getAccountRewards(userId?: string | null) {
  const ledger = userId ? await rowsByUser("AccountRewardLedger", userId, 50) : [];
  const balance = ledger.reduce((sum, row) => sum + Number(row.points || 0), 0);
  return { balance, ledger };
}

export async function getAccountMembership(userId?: string | null) {
  if (!userId) return null;
  const rows = await rowsByUser("AccountMembership", userId, 1);
  return rows[0] || null;
}