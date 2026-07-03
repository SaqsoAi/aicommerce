import fs from "fs";
import path from "path";

export type HeroDeviceKey = "desktop" | "laptop" | "tablet" | "mobile";

export type HeroCropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HeroRuntimeDraftPayload = {
  heroId: string;
  status?: string;
  lockedVersion?: string;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  cropJson?: Partial<Record<HeroDeviceKey, HeroCropBox>>;
  aiVisionJson?: unknown;
  approvalNote?: string;
  draftJson?: unknown;
};

export type HeroAnalyticsPayload = {
  heroId: string;
  variantId?: string;
  device: HeroDeviceKey;
  event: "view" | "click" | "cta";
  crop?: HeroCropBox;
  metaJson?: unknown;
};

type StoreRecord = Record<string, any>;

type HeroEnterpriseStore = {
  drafts: StoreRecord[];
  versions: StoreRecord[];
  analytics: StoreRecord[];
  variants: StoreRecord[];
};

const dataDir = path.resolve(process.cwd(), "data");
const dataFile = path.join(dataDir, "homepage-hero-enterprise.json");

function now() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    const initial: HeroEnterpriseStore = {
      drafts: [],
      versions: [],
      analytics: [],
      variants: [],
    };

    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2));
  }
}

function readStore(): HeroEnterpriseStore {
  ensureStore();

  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));

    return {
      drafts: Array.isArray(parsed?.drafts) ? parsed.drafts : [],
      versions: Array.isArray(parsed?.versions) ? parsed.versions : [],
      analytics: Array.isArray(parsed?.analytics) ? parsed.analytics : [],
      variants: Array.isArray(parsed?.variants) ? parsed.variants : [],
    };
  } catch {
    return {
      drafts: [],
      versions: [],
      analytics: [],
      variants: [],
    };
  }
}

function writeStore(store: HeroEnterpriseStore) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

export const heroEnterprisePersistenceService = {
  async saveDraft(payload: HeroRuntimeDraftPayload) {
    const store = readStore();

    const row = {
      id: createId("draft"),
      heroId: payload.heroId,
      status: payload.status || "DRAFT",
      lockedVersion: payload.lockedVersion || null,
      scheduledAt: payload.scheduledAt || null,
      publishedAt: payload.publishedAt || null,
      cropJson: payload.cropJson ?? null,
      aiVisionJson: payload.aiVisionJson ?? null,
      approvalNote: payload.approvalNote || null,
      draftJson: payload.draftJson ?? null,
      createdAt: now(),
      updatedAt: now(),
    };

    store.drafts.unshift(row);
    writeStore(store);

    return row;
  },

  async listDrafts(heroId: string) {
    const store = readStore();

    return store.drafts
      .filter((item) => item.heroId === heroId)
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
      .slice(0, 20);
  },

  async createVersion(heroId: string, snapshotJson: unknown, note?: string) {
    const store = readStore();

    const row = {
      id: createId("version"),
      heroId,
      title: `Version ${now()}`,
      status: "DRAFT",
      note: note || null,
      snapshotJson: snapshotJson ?? null,
      restoredAt: null,
      createdAt: now(),
      updatedAt: now(),
    };

    store.versions.unshift(row);
    writeStore(store);

    return row;
  },

  async listVersions(heroId: string) {
    const store = readStore();

    return store.versions
      .filter((item) => item.heroId === heroId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 30);
  },

  async restoreVersion(heroId: string, versionId: string) {
    const store = readStore();

    const version = store.versions.find(
      (item) => item.id === versionId && item.heroId === heroId
    );

    if (!version) {
      throw new Error("Hero version not found");
    }

    version.status = "RESTORED";
    version.restoredAt = now();
    version.updatedAt = now();

    writeStore(store);

    return version;
  },

  async trackAnalytics(payload: HeroAnalyticsPayload) {
    const store = readStore();

    const row = {
      id: createId("analytics"),
      heroId: payload.heroId,
      variantId: payload.variantId || null,
      device: payload.device,
      event: payload.event,
      cropJson: payload.crop ?? null,
      metaJson: payload.metaJson ?? null,
      createdAt: now(),
    };

    store.analytics.unshift(row);

    if (payload.variantId) {
      const variant = store.variants.find(
        (item) => item.id === payload.variantId
      );

      if (variant) {
        const views =
          Number(variant.views ?? 0) + (payload.event === "view" ? 1 : 0);
        const clicks =
          Number(variant.clicks ?? 0) +
          (payload.event === "click" || payload.event === "cta" ? 1 : 0);

        variant.views = views;
        variant.clicks = clicks;
        variant.ctr =
          views > 0 ? Number(((clicks / views) * 100).toFixed(2)) : 0;
        variant.updatedAt = now();
      }
    }

    writeStore(store);

    return row;
  },

  async listVariants(heroId: string) {
    const store = readStore();

    return store.variants
      .filter((item) => item.heroId === heroId)
      .sort((a, b) => {
        const status = String(a.status).localeCompare(String(b.status));
        if (status !== 0) return status;
        return Number(b.ctr ?? 0) - Number(a.ctr ?? 0);
      });
  },

  async upsertVariant(
    heroId: string,
    payload: {
      id?: string;
      name: string;
      status?: string;
      weight?: number;
      configJson?: unknown;
    }
  ) {
    const store = readStore();

    if (payload.id) {
      const existing = store.variants.find((item) => item.id === payload.id);

      if (!existing) {
        throw new Error("Hero variant not found");
      }

      existing.name = payload.name;
      existing.status = payload.status || "TESTING";
      existing.weight = payload.weight || 1;
      existing.configJson = payload.configJson ?? null;
      existing.updatedAt = now();

      writeStore(store);

      return existing;
    }

    const row = {
      id: createId("variant"),
      heroId,
      name: payload.name,
      status: payload.status || "TESTING",
      weight: payload.weight || 1,
      configJson: payload.configJson ?? null,
      views: 0,
      clicks: 0,
      ctr: 0,
      createdAt: now(),
      updatedAt: now(),
    };

    store.variants.unshift(row);
    writeStore(store);

    return row;
  },
};
