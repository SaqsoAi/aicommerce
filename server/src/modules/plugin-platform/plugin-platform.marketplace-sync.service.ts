import { createHash } from "node:crypto";

export interface MarketplaceFeedEntry {
  pluginKey: string;
  version: string;
  channel: string;
  packageSha256: string;
}

export class PluginMarketplaceSyncService {
  verifyFeed(feedJson: string, expectedSha256: string): MarketplaceFeedEntry[] {
    const actual = createHash("sha256").update(feedJson).digest("hex");
    if (actual !== expectedSha256) throw new Error("Marketplace feed hash mismatch");
    const parsed = JSON.parse(feedJson);
    if (!Array.isArray(parsed.entries)) throw new Error("Marketplace feed entries missing");
    return parsed.entries;
  }

  diff(local: MarketplaceFeedEntry[], remote: MarketplaceFeedEntry[]) {
    const localMap = new Map(local.map((item) => [`${item.pluginKey}:${item.channel}`, item.version]));
    return remote.filter((item) => localMap.get(`${item.pluginKey}:${item.channel}`) !== item.version);
  }
}

export const pluginMarketplaceSyncService = new PluginMarketplaceSyncService();
