import fs from "fs";
import path from "path";

export type FeatureScope = "SYSTEM" | "TENANT" | "STORE" | "ROLE" | "ENVIRONMENT";
export type FeatureFlagKind = "SYSTEM" | "PREVIEW" | "EXPERIMENTAL" | "KILL_SWITCH";

export type FeatureFlagRecord = {
  key: string;
  enabled: boolean;
  kind: FeatureFlagKind;
  scope: FeatureScope;
  tenantId?: string | null;
  storeId?: string | null;
  role?: string | null;
  environment?: string | null;
  reason?: string | null;
  updatedAt: string;
};

export type FeatureResolveContext = {
  tenantId?: string | null;
  storeId?: string | null;
  role?: string | null;
  environment?: string | null;
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "feature-governance.json");

const DEFAULT_FLAGS: FeatureFlagRecord[] = [
  { key: "emergency.kill.switch", enabled: false, kind: "KILL_SWITCH", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "system.maintenance", enabled: false, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "system.read.only", enabled: false, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "ai.enabled", enabled: true, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "virtualTryOn.enabled", enabled: true, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "membership.enabled", enabled: true, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "rewards.enabled", enabled: true, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "landingBuilder.enabled", enabled: true, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "homepageBuilder.enabled", enabled: true, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "analytics.enabled", enabled: true, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "aiRecommendation.enabled", enabled: true, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "aiSearch.enabled", enabled: true, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "aiChat.enabled", enabled: true, kind: "SYSTEM", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "feature.preview", enabled: false, kind: "PREVIEW", scope: "SYSTEM", updatedAt: new Date().toISOString() },
  { key: "feature.experimental", enabled: false, kind: "EXPERIMENTAL", scope: "SYSTEM", updatedAt: new Date().toISOString() }
];

function ensureStore(): { flags: FeatureFlagRecord[] } {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ flags: DEFAULT_FLAGS }, null, 2));
  }
  const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  const flags = Array.isArray(parsed.flags) ? parsed.flags : [];
  const merged = [...flags];
  for (const flag of DEFAULT_FLAGS) {
    if (!merged.some((x) => x.key === flag.key && x.scope === flag.scope)) merged.push(flag);
  }
  return { flags: merged };
}

function saveStore(store: { flags: FeatureFlagRecord[] }) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function score(flag: FeatureFlagRecord, ctx: FeatureResolveContext): number {
  let value = 0;
  if (flag.scope === "SYSTEM") value += 1;
  if (flag.scope === "ENVIRONMENT" && flag.environment && flag.environment === ctx.environment) value += 10;
  if (flag.scope === "ROLE" && flag.role && flag.role === ctx.role) value += 20;
  if (flag.scope === "STORE" && flag.storeId && flag.storeId === ctx.storeId) value += 30;
  if (flag.scope === "TENANT" && flag.tenantId && flag.tenantId === ctx.tenantId) value += 40;
  return value;
}

export const featureFlagService = {
  list(): FeatureFlagRecord[] {
    return ensureStore().flags;
  },

  resolve(key: string, ctx: FeatureResolveContext = {}): boolean {
    const store = ensureStore();
    const kill = store.flags.find((x) => x.key === "emergency.kill.switch" && x.enabled);
    if (kill && key !== "emergency.kill.switch") return false;

    const candidates = store.flags
      .filter((x) => x.key === key)
      .map((x) => ({ flag: x, weight: score(x, ctx) }))
      .filter((x) => x.weight > 0)
      .sort((a, b) => b.weight - a.weight);

    if (!candidates.length) return false;
    return Boolean(candidates[0].flag.enabled);
  },

  upsert(input: Omit<FeatureFlagRecord, "updatedAt">): FeatureFlagRecord {
    const store = ensureStore();
    const next: FeatureFlagRecord = { ...input, updatedAt: new Date().toISOString() };
    const index = store.flags.findIndex((x) =>
      x.key === next.key &&
      x.scope === next.scope &&
      (x.tenantId || null) === (next.tenantId || null) &&
      (x.storeId || null) === (next.storeId || null) &&
      (x.role || null) === (next.role || null) &&
      (x.environment || null) === (next.environment || null)
    );
    if (index >= 0) store.flags[index] = next;
    else store.flags.push(next);
    saveStore(store);
    return next;
  }
};
