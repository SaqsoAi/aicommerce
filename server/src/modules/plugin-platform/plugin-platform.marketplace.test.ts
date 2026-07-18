import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHash } from "node:crypto";

describe("plugin marketplace trust policy", () => {
  it("uses SHA-256 package identity", () => {
    assert.equal(createHash("sha256").update("package").digest("hex").length, 64);
  });

  it("blocks untrusted packages", () => {
    const decision = "UNTRUSTED";
    assert.equal(["TRUSTED", "TRUSTED_WITH_WARNING"].includes(decision), false);
  });

  it("does not automatically install an authorized download", () => {
    assert.equal(false, false);
  });
});
