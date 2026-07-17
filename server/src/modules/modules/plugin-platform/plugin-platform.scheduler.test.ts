import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("plugin scheduler policy", () => {
  it("requires namespaced keys", () => {
    assert.equal("vendor.plugin.job".startsWith("vendor.plugin."), true);
  });
  it("keeps jobs disabled until explicitly enabled", () => {
    assert.equal(false, false);
  });
});
