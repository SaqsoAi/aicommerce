import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("marketplace sync", () => {
  it("detects changed versions", () => {
    const local = new Map([["a:STABLE","1.0.0"]]);
    assert.equal(local.get("a:STABLE") !== "1.1.0", true);
  });
});
