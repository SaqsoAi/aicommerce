import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

type DefaultField = {
  groupKey: string;
  key: string;
  label: string;
  type: string;
  required?: boolean;
  sortOrder: number;
  defaultValue?: string;
};

const defaultGroups = [
  { key: "brand", label: "Brand Identity", sortOrder: 1 },
  { key: "assets", label: "Brand Assets", sortOrder: 2 },
  { key: "theme", label: "Theme Colors", sortOrder: 3 },
  { key: "contact", label: "Contact Information", sortOrder: 4 },
  { key: "social", label: "Social Links", sortOrder: 5 },
  { key: "general", label: "General Settings", sortOrder: 6 },
  { key: "localization", label: "Localization & Format", sortOrder: 7 },
  { key: "operations", label: "Store Operations", sortOrder: 8 },
  { key: "payment", label: "Payment Settings", sortOrder: 9 },
  { key: "shipping", label: "Shipping & Delivery", sortOrder: 10 },
  { key: "tax", label: "Taxes & Vat", sortOrder: 11 },
  { key: "checkout", label: "Checkout & Inventory", sortOrder: 12 },
  { key: "legal", label: "Legal & Policies", sortOrder: 13 },
];

const defaultFields: DefaultField[] = [
  { groupKey: "brand", key: "storeName", label: "Store Name", type: "text", required: true, sortOrder: 1, defaultValue: "SAQSO" },
  { groupKey: "brand", key: "shortName", label: "Short Name", type: "text", sortOrder: 2, defaultValue: "SAQSO" },
  { groupKey: "brand", key: "storeDescription", label: "Store Description", type: "textarea", sortOrder: 3, defaultValue: "Premium AI-powered commerce experience." },
  { groupKey: "brand", key: "slogan", label: "Slogan / Tagline", type: "text", sortOrder: 4, defaultValue: "AI Commerce" },

  { groupKey: "assets", key: "logo", label: "Main Logo", type: "file", sortOrder: 1 },
  { groupKey: "assets", key: "appIcon", label: "App Icon / Header Icon", type: "file", sortOrder: 0 },
  { groupKey: "assets", key: "mainLogo", label: "Main Logo Alias", type: "file", sortOrder: 2 },
  { groupKey: "assets", key: "brandLogo", label: "Brand Logo Alias", type: "file", sortOrder: 3 },
  { groupKey: "assets", key: "headerLogo", label: "Header Logo", type: "file", sortOrder: 4 },
  { groupKey: "assets", key: "footerLogo", label: "Footer Logo", type: "file", sortOrder: 5 },
  { groupKey: "assets", key: "darkLogo", label: "Dark Logo", type: "file", sortOrder: 6 },
  { groupKey: "assets", key: "whiteLogo", label: "White Logo", type: "file", sortOrder: 7 },
  { groupKey: "assets", key: "mobileLogo", label: "Mobile Logo", type: "file", sortOrder: 8 },
  { groupKey: "assets", key: "invoiceLogo", label: "Invoice Logo", type: "file", sortOrder: 9 },
  { groupKey: "assets", key: "emailLogo", label: "Email Logo", type: "file", sortOrder: 10 },
  { groupKey: "assets", key: "favicon", label: "Favicon", type: "file", sortOrder: 11 },
  { groupKey: "assets", key: "appleTouchIcon", label: "Apple Touch Icon", type: "file", sortOrder: 12 },
  { groupKey: "assets", key: "androidIcon", label: "Android Icon", type: "file", sortOrder: 13 },
  { groupKey: "assets", key: "pwaIcon", label: "PWA Icon", type: "file", sortOrder: 14 },

  { groupKey: "theme", key: "primaryColor", label: "Primary Color", type: "color", sortOrder: 1, defaultValue: "#c74b21" },
  { groupKey: "theme", key: "secondaryColor", label: "Secondary Color", type: "color", sortOrder: 2, defaultValue: "#111827" },
  { groupKey: "theme", key: "accentColor", label: "Accent Color", type: "color", sortOrder: 3, defaultValue: "#f59e0b" },
  { groupKey: "theme", key: "themeColor", label: "Browser Theme Color", type: "color", sortOrder: 4, defaultValue: "#c74b21" },

  { groupKey: "contact", key: "contactEmail", label: "Contact Email", type: "email", sortOrder: 1 },
  { groupKey: "contact", key: "supportEmail", label: "Support Email", type: "email", sortOrder: 2 },
  { groupKey: "contact", key: "contactPhone", label: "Contact Phone", type: "text", sortOrder: 3 },
  { groupKey: "contact", key: "supportPhone", label: "Support Phone", type: "text", sortOrder: 4 },
  { groupKey: "contact", key: "address", label: "Address", type: "textarea", sortOrder: 5 },
  { groupKey: "contact", key: "storeAddress", label: "Store Address", type: "textarea", sortOrder: 6 },
  { groupKey: "contact", key: "website", label: "Website", type: "url", sortOrder: 7 },

  { groupKey: "social", key: "facebook", label: "Facebook", type: "url", sortOrder: 1 },
  { groupKey: "social", key: "instagram", label: "Instagram", type: "url", sortOrder: 2 },
  { groupKey: "social", key: "tiktok", label: "TikTok", type: "url", sortOrder: 3 },
  { groupKey: "social", key: "youtube", label: "YouTube", type: "url", sortOrder: 4 },
  { groupKey: "social", key: "linkedin", label: "LinkedIn", type: "url", sortOrder: 5 },

  { groupKey: "operations", key: "maintenanceMode", label: "Maintenance Mode", type: "toggle", sortOrder: 1, defaultValue: "false" },
  { groupKey: "operations", key: "storeViewLink", label: "Store View Link", type: "url", sortOrder: 2 },
  { groupKey: "checkout", key: "guestCheckout", label: "Guest Checkout", type: "toggle", sortOrder: 1, defaultValue: "true" },
  { groupKey: "legal", key: "termsConditions", label: "Terms & Conditions", type: "textarea", sortOrder: 1 },
  { groupKey: "legal", key: "privacyPolicy", label: "Privacy Policy", type: "textarea", sortOrder: 2 },
  { groupKey: "legal", key: "returnRefundPolicy", label: "Return & Refund Policy", type: "textarea", sortOrder: 3 },
];



const BRAND_FIELD_ALIASES: Record<string, string[]> = {
  logo: ["logoUrl", "websiteLogo", "headerLogoUrl"],
  appIcon: ["appIconUrl", "app_icon_url"],
  footerLogo: ["footerLogoUrl"],
  darkLogo: ["darkLogoUrl"],
  whiteLogo: ["whiteLogoUrl"],
  mobileLogo: ["mobileLogoUrl"],
  invoiceLogo: ["invoiceLogoUrl"],
  emailLogo: ["emailLogoUrl"],
  favicon: ["faviconUrl"],
  appleTouchIcon: ["appleTouchIconUrl"],
  androidIcon: ["androidIconUrl"],
  pwaIcon: ["pwaIconUrl"],
};

function aliasesForKey(key: string) {
  return BRAND_FIELD_ALIASES[key] || [];
}

function canonicalKeyFor(key: string) {
  const clean = String(key || "").trim();

  if (BRAND_FIELD_ALIASES[clean]) return clean;

  for (const [canonical, aliases] of Object.entries(BRAND_FIELD_ALIASES)) {
    if (aliases.includes(clean)) return canonical;
  }

  return clean;
}

function cloneAliasField(field: any, aliasKey: string) {
  return {
    ...field,
    id: `${field.id}__alias__${aliasKey}`,
    key: aliasKey,
    name: aliasKey,
    aliasOf: field.key,
    sourceFieldId: field.id,
    value: field.value,
    valueJson: field.valueJson,
  };
}

function expandFieldAliases(fields: any[]) {
  const byKey = new Map<string, any>();

  for (const field of fields || []) {
    if (!field?.key) continue;

    const canonicalKey = canonicalKeyFor(field.key);
    const canonicalValue =
      field.value !== undefined && field.value !== null && String(field.value).trim() !== ""
        ? field.value
        : field.valueJson;

    const normalized = {
      ...field,
      key: canonicalKey,
      name: canonicalKey,
      value: canonicalValue ?? "",
      valueJson: canonicalValue ?? "",
    };

    const existing = byKey.get(canonicalKey);
    if (!existing || String(existing.value || "").trim() === "") {
      byKey.set(canonicalKey, normalized);
    }
  }

  const expanded: any[] = [];

  for (const field of byKey.values()) {
    expanded.push(field);

    for (const aliasKey of aliasesForKey(field.key)) {
      if (byKey.has(aliasKey)) continue;
      expanded.push(cloneAliasField(field, aliasKey));
    }
  }

  const seen = new Set<string>();
  return expanded.filter((field) => {
    const key = String(field.key || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function labelFromKey(key: string) {
  return String(key || "general")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function resolveSettingGroup(groupKey?: string, groupId?: string) {
  if (groupId) {
    const existing = await prisma.enterpriseStoreSettingGroup.findUnique({
      where: { id: groupId },
    });

    if (existing) return existing;
  }

  const key = String(groupKey || "general").trim() || "general";

  const existing = await prisma.enterpriseStoreSettingGroup.findUnique({
    where: { key },
  });

  if (existing) return existing;

  const defaultGroup = defaultGroups.find((group) => group.key === key);

  return prisma.enterpriseStoreSettingGroup.create({
    data: {
      key,
      label: defaultGroup?.label || labelFromKey(key),
      sortOrder: defaultGroup?.sortOrder || 999,
      enabled: true,
    },
  });
}

async function ensureUniqueFieldKey(key: string) {
  const normalized = String(key || "").trim();
  if (!normalized) throw new Error("Field key is required");
  return normalized;
}
function fieldValue(field: any) {
  if (field.value !== undefined) return field.value;
  if (field.valueJson !== undefined && field.valueJson !== null) return field.valueJson;
  return "";
}



function normalizeField(field: any, group?: any) {
  const value = fieldValue(field);

  return {
    id: field.id,
    key: field.key,
    name: field.key,
    label: field.label || labelFromKey(field.key),
    type: field.type || "text",
    required: Boolean(field.required),
    enabled: field.enabled !== false,
    sortOrder: field.sortOrder || 0,
    category: group?.label || group?.key || "General",
    group: group?.label || group?.key || "General",
    value,
    valueJson: value,
  };
}
function normalizeGroup(group: any) {
  return {
    ...group,
    fields: expandFieldAliases((group.fields || []).map((field: any) => normalizeField(field, group))),
  };
}

async function getGroups() {
  return prisma.enterpriseStoreSettingGroup.findMany({
    include: { fields: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

async function getFlatSettings() {
  const groups = await getGroups();
  return expandFieldAliases(groups.flatMap((group: any) => (group.fields || []).map((field: any) => normalizeField(field, group))));
}

async function seedDefaults() {
  const groupMap = new Map<string, string>();

  for (const group of defaultGroups) {
    const saved = await prisma.enterpriseStoreSettingGroup.upsert({
      where: { key: group.key },
      update: {
        label: group.label,
        sortOrder: group.sortOrder,
        enabled: true,
      },
      create: {
        key: group.key,
        label: group.label,
        sortOrder: group.sortOrder,
        enabled: true,
      },
    });

    groupMap.set(group.key, saved.id);
  }

  for (const item of defaultFields) {
    const groupId = groupMap.get(item.groupKey);
    if (!groupId) continue;

    const existing = await prisma.enterpriseStoreSettingField.findUnique({
      where: { key: item.key },
    });

    await prisma.enterpriseStoreSettingField.upsert({
      where: { key: item.key },
      update: {
        groupId,
        label: item.label,
        type: item.type,
        required: Boolean(item.required),
        sortOrder: Number(item.sortOrder || 0),
        enabled: true,
      },
      create: {
        groupId,
        key: item.key,
        label: item.label,
        type: item.type,
        required: Boolean(item.required),
        sortOrder: Number(item.sortOrder || 0),
        enabled: true,
        valueJson: item.defaultValue ?? "",
      },
    });

    if (existing && (existing as any).valueJson === null && item.defaultValue !== undefined) {
      await prisma.enterpriseStoreSettingField.update({
        where: { key: item.key },
        data: { valueJson: item.defaultValue },
      });
    }
  }
}

router.get("/", async (_req, res) => {
  const groups = await getGroups();
  const data = expandFieldAliases(groups.flatMap((group: any) => (group.fields || []).map((field: any) => normalizeField(field, group))));

  res.json({
    success: true,
    data,
    settings: data,
    groups: groups.map(normalizeGroup),
  });
});

router.get("/public", async (_req, res) => {
  const data = await getFlatSettings();
  res.json({ success: true, data, settings: data });
});

router.get("/client", async (_req, res) => {
  const data = await getFlatSettings();
  res.json({ success: true, data, settings: data });
});

router.post("/seed", async (_req, res) => {
  await seedDefaults();
  const groups = await getGroups();
  const data = expandFieldAliases(groups.flatMap((group: any) => (group.fields || []).map((field: any) => normalizeField(field, group))));

  res.json({
    success: true,
    message: "Enterprise Store Settings seeded",
    data,
    settings: data,
    groups: groups.map(normalizeGroup),
  });
});

router.patch("/field/:id", async (req, res) => {
  try {

    const incomingValue = req.body?.value;
    const incomingValueJson = req.body?.valueJson;
    const value =
      incomingValueJson !== undefined && incomingValueJson !== null && String(incomingValueJson).trim() !== ""
        ? incomingValueJson
        : incomingValue !== undefined && incomingValue !== null && String(incomingValue).trim() !== ""
          ? incomingValue
          : "";
    const rawId = String(req.params.id || "");
    const sourceId = rawId.includes("__alias__") ? rawId.split("__alias__")[0] : rawId;

    const target = await prisma.enterpriseStoreSettingField.findUnique({
      where: { id: sourceId },
      include: { group: true },
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Field not found for PATCH",
      });
    }

    const canonicalKey = canonicalKeyFor(target.key);
    const keysToSync = Array.from(
      new Set([canonicalKey, target.key, ...aliasesForKey(canonicalKey)])
    ).filter(Boolean);

    const canonical =
      (await prisma.enterpriseStoreSettingField.findUnique({
        where: { key: canonicalKey },
        include: { group: true },
      })) || target;

    const updated = await prisma.enterpriseStoreSettingField.update({
      where: { id: canonical.id },
      data: { valueJson: value },
      include: { group: true },
    });

    await prisma.enterpriseStoreSettingField.updateMany({
      where: {
        key: { in: keysToSync },
        NOT: { id: updated.id },
      },
      data: { valueJson: value },
    });

    const reloaded = await prisma.enterpriseStoreSettingField.findUnique({
      where: { id: updated.id },
      include: { group: true },
    });

    return res.json({
      success: true,
      data: normalizeField(reloaded || updated, (reloaded || updated).group),
      field: normalizeField(reloaded || updated, (reloaded || updated).group),
      canonicalKey,
      syncedKeys: keysToSync,
      persistedValue: value,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to patch enterprise setting field",
    });
  }
});
router.patch("/bulk", async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  for (const item of items) {
    if (!item?.id) continue;
    await prisma.enterpriseStoreSettingField.update({
      where: { id: item.id },
      data: { valueJson: item.value ?? item.valueJson ?? "" },
    });
  }

  const data = await getFlatSettings();
  res.json({ success: true, data, settings: data });
});

router.post("/group", async (req, res) => {
  const group = await prisma.enterpriseStoreSettingGroup.create({
    data: {
      key: req.body.key,
      label: req.body.label,
      description: req.body.description,
      sortOrder: Number(req.body.sortOrder || 0),
      enabled: req.body.enabled ?? true,
    },
  });

  res.json({ success: true, group });
});

router.patch("/group/:id", async (req, res) => {
  const group = await prisma.enterpriseStoreSettingGroup.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({ success: true, group });
});

router.post("/field", async (req, res) => {
  try {
    const key = await ensureUniqueFieldKey(canonicalKeyFor(req.body.key));
    const group = await resolveSettingGroup(req.body.groupKey, req.body.groupId);

    const field = await prisma.enterpriseStoreSettingField.upsert({
      where: { key },
      update: {
        groupId: group.id,
        label: req.body.label || labelFromKey(key),
        type: req.body.type || "text",
        valueJson: req.body.value ?? req.body.valueJson ?? "",
        required: Boolean(req.body.required),
        enabled: req.body.enabled ?? true,
        sortOrder: Number(req.body.sortOrder || 999),
      },
      create: {
        groupId: group.id,
        key,
        label: req.body.label || labelFromKey(key),
        type: req.body.type || "text",
        valueJson: req.body.value ?? req.body.valueJson ?? "",
        required: Boolean(req.body.required),
        enabled: req.body.enabled ?? true,
        sortOrder: Number(req.body.sortOrder || 999),
      },
    });

    const normalized = normalizeField(field, group);

    res.json({
      success: true,
      field: normalized,
      data: normalized,
      message: "Enterprise setting field saved",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Failed to save enterprise setting field",
    });
  }
});

router.delete("/field/:id", async (req, res) => {
  await prisma.enterpriseStoreSettingField.delete({
    where: { id: req.params.id },
  });

  res.json({ success: true });
});

export default router;





