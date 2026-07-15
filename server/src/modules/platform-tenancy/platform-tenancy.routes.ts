import { Router, type NextFunction, type Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";
import { protect, type AuthRequest } from "../auth/auth.middleware";

const router = Router();

const STORE_PERMISSION_CATALOG = [
  { key: "dashboard.view", label: "Dashboard", group: "Dashboard", roles: ["ADMIN", "MANAGER"] },
  { key: "analytics.view", label: "Analytics & Reports", group: "Dashboard", roles: ["ADMIN", "MANAGER"] },
  { key: "products.manage", label: "Products", group: "Catalog", roles: ["ADMIN", "MANAGER"] },
  { key: "categories.manage", label: "Categories", group: "Catalog", roles: ["ADMIN", "MANAGER"] },
  { key: "brands.manage", label: "Brands", group: "Catalog", roles: ["ADMIN"] },
  { key: "inventory.manage", label: "Inventory", group: "Inventory", roles: ["ADMIN", "MANAGER"] },
  { key: "orders.manage", label: "Orders", group: "Sales", roles: ["ADMIN", "MANAGER"] },
  { key: "returns.manage", label: "Returns & Refunds", group: "Sales", roles: ["ADMIN"] },
  { key: "customers.manage", label: "Customers", group: "Customers", roles: ["ADMIN", "MANAGER"] },
  { key: "reviews.manage", label: "Reviews", group: "Customers", roles: ["ADMIN", "MANAGER"] },
  { key: "marketing.manage", label: "Marketing", group: "Marketing", roles: ["ADMIN"] },
  { key: "cms.manage", label: "Website CMS", group: "Website CMS", roles: ["ADMIN"] },
  { key: "lookbooks.manage", label: "Lookbooks", group: "Website CMS", roles: ["ADMIN", "MANAGER"] },
  { key: "templates.view", label: "Templates (View)", group: "Appearance", roles: ["ADMIN", "MANAGER"] },
  { key: "templates.activate", label: "Templates (Activate)", group: "Appearance", roles: ["ADMIN"] },
  { key: "domains.view", label: "Domains (View)", group: "Store", roles: ["ADMIN"] },
  { key: "store.settings", label: "Store Settings", group: "Store", roles: ["ADMIN"] },
  { key: "store.users.manage", label: "Store Users", group: "Store", roles: ["ADMIN"] },
  { key: "ai.features.use", label: "Use Store AI Features", group: "AI", roles: ["ADMIN", "MANAGER"] },
  { key: "ai.features.configure", label: "Configure Store AI", group: "AI", roles: ["ADMIN"] },
] as const;

const STORE_PERMISSION_PRESETS = {
  ADMIN: STORE_PERMISSION_CATALOG
    .filter((permission) => (permission.roles as readonly string[]).includes("ADMIN"))
    .map((permission) => permission.key),
  MANAGER: STORE_PERMISSION_CATALOG
    .filter((permission) => (permission.roles as readonly string[]).includes("MANAGER"))
    .map((permission) => permission.key),
};

function normalizeStorePermissions(value: unknown, role: string): string[] {
  const allowed = new Set<string>(
    STORE_PERMISSION_CATALOG.map((permission) => permission.key),
  );
  const requested: string[] = Array.isArray(value)
    ? value.map((permission) => cleanText(permission)).filter(Boolean)
    : [];

  const normalized = [...new Set(requested)].filter((permission) => allowed.has(permission));
  return normalized.length
    ? normalized
    : [...STORE_PERMISSION_PRESETS[role === "MANAGER" ? "MANAGER" : "ADMIN"]];
}


function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (String(req.user?.role || "").toUpperCase() !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, message: "SUPER_ADMIN access required." });
  }
  return next();
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function cleanSlug(value: unknown): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


router.get("/me-context", protect, async (req: AuthRequest, res: Response) => {
  const userId = String(req.user?.id || req.user?.userId || "").trim();
  if (!userId) {
    return res.status(401).json({ success: false, message: "Authenticated user is required." });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      tenantId: true,
      storeId: true,
      tenant: { select: { id: true, name: true, slug: true, status: true } },
      store: {
        select: {
          id: true,
          name: true,
          status: true,
          primaryDomain: true,
          templates: {
            where: { isActive: true },
            take: 1,
            include: { template: true },
          },
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User context was not found." });
  }

  return res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      tenant: user.tenant,
      store: user.store
        ? {
            ...user.store,
            activeTemplate: user.store.templates[0]?.template ?? null,
          }
        : null,
    },
  });
});

router.use(protect, requireSuperAdmin);

router.get("/catalog", async (_req, res) => {
  const [tenants, templates] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        stores: {
          orderBy: { createdAt: "desc" },
          include: {
            templates: {
              orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
              include: { template: true },
            },
          },
        },
      },
    }),
    prisma.template.findMany({
      orderBy: { name: "asc" },
      include: {
        stores: {
          include: {
            store: { include: { tenant: true } },
          },
        },
      },
    }),
  ]);

  res.json({ success: true, data: { tenants, templates } });
});

router.post("/tenants", async (req, res) => {
  const name = cleanText(req.body?.name);
  const slug = cleanSlug(req.body?.slug || name);
  const status = cleanText(req.body?.status || "ACTIVE").toUpperCase();

  if (!name || !slug) {
    return res.status(400).json({ success: false, message: "Tenant name and slug are required." });
  }

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      status,
      storefrontEnabled: req.body?.storefrontEnabled !== false,
    },
  });

  return res.status(201).json({ success: true, data: tenant });
});

router.patch("/tenants/:id", async (req, res) => {
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: req.params.id },
    select: { id: true },
  });
  if (!existingTenant) {
    return res.status(404).json({ success: false, message: "Tenant was not found." });
  }
  if (req.body?.name !== undefined && !cleanText(req.body.name)) {
    return res.status(400).json({ success: false, message: "Tenant name cannot be empty." });
  }
  if (req.body?.slug !== undefined && !cleanSlug(req.body.slug)) {
    return res.status(400).json({ success: false, message: "Tenant slug cannot be empty." });
  }
  const tenant = await prisma.tenant.update({
    where: { id: req.params.id },
    data: {
      ...(req.body?.name !== undefined ? { name: cleanText(req.body.name) } : {}),
      ...(req.body?.slug !== undefined ? { slug: cleanSlug(req.body.slug) } : {}),
      ...(req.body?.status !== undefined ? { status: cleanText(req.body.status).toUpperCase() } : {}),
      ...(req.body?.storefrontEnabled !== undefined
        ? { storefrontEnabled: Boolean(req.body.storefrontEnabled) }
        : {}),
    },
  });

  return res.json({ success: true, data: tenant });
});

router.post("/stores", async (req, res) => {
  const name = cleanText(req.body?.name);
  const tenantId = cleanText(req.body?.tenantId);

  if (!name || !tenantId) {
    return res.status(400).json({ success: false, message: "Store name and tenant are required." });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
  if (!tenant) {
    return res.status(404).json({ success: false, message: "Tenant was not found." });
  }

  const store = await prisma.store.create({
    data: {
      name,
      tenantId,
      status: cleanText(req.body?.status || "ACTIVE").toUpperCase(),
      storefrontEnabled: req.body?.storefrontEnabled !== false,
      primaryDomain: req.body?.primaryDomain
        ? cleanText(req.body.primaryDomain).toLowerCase()
        : null,
    },
  });

  return res.status(201).json({ success: true, data: store });
});

router.patch("/stores/:id", async (req, res) => {
  const existingStore = await prisma.store.findUnique({
    where: { id: req.params.id },
    select: { id: true },
  });
  if (!existingStore) {
    return res.status(404).json({ success: false, message: "Store was not found." });
  }
  if (req.body?.name !== undefined && !cleanText(req.body.name)) {
    return res.status(400).json({ success: false, message: "Store name cannot be empty." });
  }
  if (req.body?.tenantId !== undefined) {
    const targetTenant = await prisma.tenant.findUnique({
      where: { id: cleanText(req.body.tenantId) },
      select: { id: true },
    });
    if (!targetTenant) {
      return res.status(400).json({ success: false, message: "Selected tenant was not found." });
    }
  }
  const store = await prisma.store.update({
    where: { id: req.params.id },
    data: {
      ...(req.body?.name !== undefined ? { name: cleanText(req.body.name) } : {}),
      ...(req.body?.tenantId !== undefined ? { tenantId: cleanText(req.body.tenantId) } : {}),
      ...(req.body?.status !== undefined ? { status: cleanText(req.body.status).toUpperCase() } : {}),
      ...(req.body?.storefrontEnabled !== undefined
        ? { storefrontEnabled: Boolean(req.body.storefrontEnabled) }
        : {}),
      ...(req.body?.primaryDomain !== undefined
        ? {
            primaryDomain: req.body.primaryDomain
              ? cleanText(req.body.primaryDomain).toLowerCase()
              : null,
          }
        : {}),
    },
  });

  return res.json({ success: true, data: store });
});

router.post("/templates", async (req, res) => {
  const name = cleanText(req.body?.name);
  const slug = cleanSlug(req.body?.slug || name);

  if (!name || !slug) {
    return res.status(400).json({ success: false, message: "Template name and slug are required." });
  }

  const template = await prisma.template.upsert({
    where: { slug },
    update: {
      name,
      description:
        req.body?.description === undefined ? undefined : cleanText(req.body.description) || null,
      previewUrl:
        req.body?.previewUrl === undefined ? undefined : cleanText(req.body.previewUrl) || null,
      isActive: req.body?.isActive !== false,
    },
    create: {
      name,
      slug,
      description: cleanText(req.body?.description) || null,
      previewUrl: cleanText(req.body?.previewUrl) || null,
      isActive: req.body?.isActive !== false,
    },
  });

  return res.status(201).json({ success: true, data: template });
});

router.patch("/templates/:id", async (req, res) => {
  const template = await prisma.template.update({
    where: { id: req.params.id },
    data: {
      ...(req.body?.name !== undefined ? { name: cleanText(req.body.name) } : {}),
      ...(req.body?.slug !== undefined ? { slug: cleanSlug(req.body.slug) } : {}),
      ...(req.body?.description !== undefined
        ? { description: cleanText(req.body.description) || null }
        : {}),
      ...(req.body?.previewUrl !== undefined
        ? { previewUrl: cleanText(req.body.previewUrl) || null }
        : {}),
      ...(req.body?.isActive !== undefined ? { isActive: Boolean(req.body.isActive) } : {}),
    },
  });

  return res.json({ success: true, data: template });
});

router.post("/templates/register-imported", async (req, res) => {
  const name = cleanText(req.body?.name || req.body?.templateKey);
  const slug = cleanSlug(req.body?.slug || req.body?.templateKey || name);
  const storeId = cleanText(req.body?.storeId);

  if (!name || !slug) {
    return res.status(400).json({ success: false, message: "Imported template name/key is required." });
  }

  const result = await prisma.$transaction(async (tx) => {
    const template = await tx.template.upsert({
      where: { slug },
      update: {
        name,
        description: cleanText(req.body?.description) || "Imported by SAQSO AI Migrator",
        previewUrl: cleanText(req.body?.previewUrl) || null,
        isActive: true,
      },
      create: {
        name,
        slug,
        description: cleanText(req.body?.description) || "Imported by SAQSO AI Migrator",
        previewUrl: cleanText(req.body?.previewUrl) || null,
        isActive: true,
      },
    });

    if (!storeId) return { template, assignment: null };

    const store = await tx.store.findUnique({ where: { id: storeId }, select: { id: true } });
    if (!store) throw Object.assign(new Error("Target store was not found."), { statusCode: 404 });

    if (req.body?.activate === true) {
      await tx.storeTemplate.updateMany({ where: { storeId }, data: { isActive: false } });
    }

    const assignment = await tx.storeTemplate.upsert({
      where: { storeId_templateId: { storeId, templateId: template.id } },
      update: { isActive: req.body?.activate === true },
      create: { storeId, templateId: template.id, isActive: req.body?.activate === true },
      include: { template: true },
    });

    return { template, assignment };
  });

  return res.status(201).json({ success: true, data: result });
});

router.post("/template-assignments", async (req, res) => {
  const storeId = cleanText(req.body?.storeId);
  const templateId = cleanText(req.body?.templateId);

  if (!storeId || !templateId) {
    return res.status(400).json({ success: false, message: "Store and template are required." });
  }

  if (req.body?.isActive === true) {
    await prisma.storeTemplate.updateMany({ where: { storeId }, data: { isActive: false } });
  }

  const assignment = await prisma.storeTemplate.upsert({
    where: { storeId_templateId: { storeId, templateId } },
    update: { isActive: Boolean(req.body?.isActive) },
    create: { storeId, templateId, isActive: Boolean(req.body?.isActive) },
    include: { store: { include: { tenant: true } }, template: true },
  });

  return res.json({ success: true, data: assignment });
});

router.patch("/template-assignments/:id/activate", async (req, res) => {
  const current = await prisma.storeTemplate.findUnique({ where: { id: req.params.id } });
  if (!current) {
    return res.status(404).json({ success: false, message: "Template assignment was not found." });
  }

  const assignment = await prisma.$transaction(async (tx) => {
    await tx.storeTemplate.updateMany({
      where: { storeId: current.storeId },
      data: { isActive: false },
    });

    return tx.storeTemplate.update({
      where: { id: current.id },
      data: { isActive: true },
      include: { store: { include: { tenant: true } }, template: true },
    });
  });

  return res.json({ success: true, data: assignment });
});

router.delete("/template-assignments/:id", async (req, res) => {
  const current = await prisma.storeTemplate.findUnique({ where: { id: req.params.id } });
  if (!current) {
    return res.status(404).json({ success: false, message: "Template assignment was not found." });
  }
  if (current.isActive) {
    return res.status(409).json({
      success: false,
      message: "Activate another template before removing the current active template.",
    });
  }

  await prisma.storeTemplate.delete({ where: { id: current.id } });
  return res.json({ success: true, data: { id: current.id } });
});



router.get("/store-permissions", async (_req, res) => {
  return res.json({
    success: true,
    data: {
      catalog: STORE_PERMISSION_CATALOG,
      presets: STORE_PERMISSION_PRESETS,
    },
  });
});

router.get("/store-users", async (req, res) => {
  const tenantId = cleanText(req.query.tenantId);
  const storeId = cleanText(req.query.storeId);

  const users = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "MANAGER"] },
      ...(tenantId ? { tenantId } : {}),
      ...(storeId ? { storeId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      tenantId: true,
      storeId: true,
      emailVerified: true,
      permissions: true,
      createdAt: true,
      tenant: { select: { id: true, name: true, slug: true } },
      store: { select: { id: true, name: true, status: true } },
    },
  });

  return res.json({ success: true, data: users });
});

router.post("/store-users", async (req, res) => {
  const name = cleanText(req.body?.name);
  const email = cleanText(req.body?.email).toLowerCase();
  const password = cleanText(req.body?.password);
  const role = cleanText(req.body?.role).toUpperCase();
  const tenantId = cleanText(req.body?.tenantId);
  const storeId = cleanText(req.body?.storeId);

  if (!name || !email || !password || !tenantId || !storeId) {
    return res.status(400).json({
      success: false,
      message: "Name, email, password, tenant and store are required.",
    });
  }

  if (!["ADMIN", "MANAGER"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Only ADMIN or MANAGER can be provisioned from this screen.",
    });
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, tenantId },
    select: { id: true, tenantId: true },
  });

  if (!store) {
    return res.status(400).json({
      success: false,
      message: "Selected store does not belong to the selected tenant.",
    });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: "A user with this email already exists.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role as "ADMIN" | "MANAGER",
      tenantId,
      storeId,
      emailVerified: true,
      permissions: normalizeStorePermissions(req.body?.permissions, role),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      tenantId: true,
      storeId: true,
      permissions: true,
      createdAt: true,
    },
  });

  return res.status(201).json({ success: true, data: user });
});

router.patch("/store-users/:id", async (req, res) => {
  const role = req.body?.role !== undefined ? cleanText(req.body.role).toUpperCase() : undefined;
  if (role !== undefined && !["ADMIN", "MANAGER"].includes(role)) {
    return res.status(400).json({ success: false, message: "Role must be ADMIN or MANAGER." });
  }

  const tenantId = req.body?.tenantId !== undefined ? cleanText(req.body.tenantId) : undefined;
  const storeId = req.body?.storeId !== undefined ? cleanText(req.body.storeId) : undefined;

  if (tenantId && storeId) {
    const store = await prisma.store.findFirst({ where: { id: storeId, tenantId }, select: { id: true } });
    if (!store) {
      return res.status(400).json({ success: false, message: "Store does not belong to tenant." });
    }
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(req.body?.name !== undefined ? { name: cleanText(req.body.name) } : {}),
      ...(role !== undefined ? { role: role as "ADMIN" | "MANAGER" } : {}),
      ...(tenantId !== undefined ? { tenantId: tenantId || null } : {}),
      ...(storeId !== undefined ? { storeId: storeId || null } : {}),
      ...(req.body?.permissions !== undefined
        ? { permissions: normalizeStorePermissions(req.body.permissions, role ?? "ADMIN") }
        : {}),
      ...(req.body?.password
        ? { password: await bcrypt.hash(cleanText(req.body.password), 12) }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      tenantId: true,
      storeId: true,
      permissions: true,
      updatedAt: true,
    },
  });

  return res.json({ success: true, data: user });
});


export default router;
