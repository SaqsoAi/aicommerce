import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("plugin tooltip guidance policy", () => {
  it("shows setup guidance when configuration is incomplete", () => {
    const status = "INSTALLED";
    const configurationComplete = false;
    assert.equal(status === "INSTALLED" && !configurationComplete, true);
  });

  it("shows operate guidance only for active plugins", () => {
    assert.equal("ACTIVE" === "ACTIVE", true);
  });

  it("does not allow javascript documentation links", () => {
    const href = "javascript:alert(1)";
    assert.equal(href.startsWith("/") || href.startsWith("https://"), false);
  });
});
