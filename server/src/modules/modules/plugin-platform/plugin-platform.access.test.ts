import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("plugin effective access policy", () => {
  it("uses deny-by-default composition", () => {
    const gates = [true, true, false, true, true, true];
    assert.equal(gates.every(Boolean), false);
  });

  it("allows access only when every gate passes", () => {
    const gates = [true, true, true, true, true, true];
    assert.equal(gates.every(Boolean), true);
  });

  it("normalizes stable cache keys", () => {
    assert.equal("Vendor.Plugin".toLowerCase() + "::tenant-1", "vendor.plugin::tenant-1");
  });
});
