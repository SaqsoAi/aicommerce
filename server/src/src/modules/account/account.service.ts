import prisma from "../../config/prisma";

type AccountProfileInput = {
  displayName?: string;
  avatarUrl?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
};

type AccountAddressInput = {
  label?: string;
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
  isDefault?: boolean;
};

async function requireUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true, tenantId: true, storeId: true },
  });
  if (!user) throw new Error("Account user not found");
  return user;
}

async function ensureProfile(userId: string) {
  const user = await requireUser(userId);
  return prisma.accountProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      displayName: user.name || user.email,
      avatarUrl: user.avatar,
      phone: user.phone,
      joinedAt: user.createdAt,
    },
  });
}

export async function getAccountDashboard(userId: string) {
  const user = await requireUser(userId);
  const profile = await ensureProfile(userId);

  const [addresses, membership, ledger, recentOrders, wishlist, recommendations] = await Promise.all([
    prisma.accountAddress.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] }),
    prisma.accountMembership.findUnique({ where: { userId } }),
    prisma.accountRewardLedger.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { include: { product: { select: { id: true, name: true, thumbnail: true } } } }, timelines: true },
    }),
    prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", visibility: "PUBLIC", ...(user.storeId ? { storeId: user.storeId } : {}) },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: 8,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);

  const rewardBalance = ledger.reduce((sum, entry) => sum + entry.points, 0);
  return {
    profile: { ...profile, email: user.email, addresses },
    membership,
    rewards: { balance: rewardBalance, ledger },
    recentOrders,
    wishlist,
    recommendations,
  };
}

export async function getAccountProfile(userId: string) {
  const user = await requireUser(userId);
  const profile = await ensureProfile(userId);
  return { ...profile, email: user.email };
}

export async function updateAccountProfile(userId: string, body: AccountProfileInput) {
  const profile = await ensureProfile(userId);
  const displayName = body.displayName?.trim() || undefined;
  const dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
  if (dateOfBirth && Number.isNaN(dateOfBirth.getTime())) throw new Error("Invalid date of birth");

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.accountProfile.update({
      where: { userId },
      data: {
        displayName,
        avatarUrl: body.avatarUrl === undefined ? undefined : body.avatarUrl,
        phone: body.phone === undefined ? undefined : body.phone?.trim() || null,
        dateOfBirth,
        gender: body.gender === undefined ? undefined : body.gender?.trim() || null,
      },
    });
    await tx.user.update({
      where: { id: userId },
      data: {
        name: displayName,
        avatar: body.avatarUrl === undefined ? undefined : body.avatarUrl,
      },
    });
    return next;
  });
  return updated;
}

export async function getAccountAddresses(userId: string) {
  await requireUser(userId);
  return prisma.accountAddress.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] });
}

export async function createAccountAddress(userId: string, body: AccountAddressInput) {
  const profile = await ensureProfile(userId);
  if (!body.line1?.trim()) throw new Error("Address line 1 is required");
  return prisma.$transaction(async (tx) => {
    if (body.isDefault) await tx.accountAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.accountAddress.create({
      data: {
        userId,
        profileId: profile.id,
        label: body.label?.trim() || "Home",
        fullName: body.fullName?.trim() || null,
        phone: body.phone?.trim() || null,
        line1: body.line1.trim(),
        line2: body.line2?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        postalCode: body.postalCode?.trim() || null,
        country: body.country?.trim() || "Bangladesh",
        isDefault: Boolean(body.isDefault),
      },
    });
  });
}

export async function updateAccountAddress(userId: string, addressId: string, body: AccountAddressInput) {
  const existing = await prisma.accountAddress.findFirst({ where: { id: addressId, userId } });
  if (!existing) throw new Error("Address not found");
  return prisma.$transaction(async (tx) => {
    if (body.isDefault) await tx.accountAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.accountAddress.update({
      where: { id: addressId },
      data: {
        label: body.label?.trim(), fullName: body.fullName?.trim(), phone: body.phone?.trim(),
        line1: body.line1?.trim(), line2: body.line2?.trim(), city: body.city?.trim(), state: body.state?.trim(),
        postalCode: body.postalCode?.trim(), country: body.country?.trim(), isDefault: body.isDefault,
      },
    });
  });
}

export async function deleteAccountAddress(userId: string, addressId: string) {
  const existing = await prisma.accountAddress.findFirst({ where: { id: addressId, userId } });
  if (!existing) throw new Error("Address not found");
  await prisma.accountAddress.delete({ where: { id: addressId } });
  return { id: addressId };
}

export async function getAccountOrders(userId: string) {
  return prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { items: true, timelines: true } });
}

export async function getAccountWishlist(userId: string) {
  return prisma.wishlist.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { product: { include: { images: true } } } });
}

export async function getAccountRewards(userId: string) {
  const ledger = await prisma.accountRewardLedger.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
  return { balance: ledger.reduce((sum, entry) => sum + entry.points, 0), ledger };
}

export async function getAccountMembership(userId: string) {
  return prisma.accountMembership.findUnique({ where: { userId } });
}

export async function listCustomerAccounts() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" }, orderBy: { createdAt: "desc" }, take: 200,
    select: { id: true, name: true, email: true, phone: true, avatar: true, emailVerified: true, createdAt: true, tenantId: true, storeId: true, _count: { select: { orders: true, wishlist: true } } },
  });
  const profiles = await prisma.accountProfile.findMany({ where: { userId: { in: customers.map((item) => item.id) } }, include: { membership: true, rewards: true, addresses: true } });
  const byUser = new Map(profiles.map((profile) => [profile.userId, profile]));
  return customers.map((customer) => ({ ...customer, account: byUser.get(customer.id) || null }));
}
