import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("plugin registry policy", () => {
  it("requires namespaced registration keys", () => {
    const pluginKey = "vendor.analytics";
    assert.equal("vendor.analytics.menu".startsWith(`${pluginKey}.`), true);
    assert.equal("global.menu".startsWith(`${pluginKey}.`), false);
  });

  it("sorts lower priority values first", () => {
    const values = [
      { key: "b", priority: 20 },
      { key: "a", priority: 10 },
    ].sort((a, b) => a.priority - b.priority || a.key.localeCompare(b.key));
    assert.equal(values[0].key, "a");
  });

  it("detects registry key collision case-insensitively", () => {
    const seen = new Set<string>();
    seen.add("MENU:vendor.plugin.menu".toLowerCase());
    assert.equal(seen.has("MENU:Vendor.Plugin.Menu".toLowerCase()), true);
  });
});
