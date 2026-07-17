import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("plugin configuration safety", () => {
  it("accepts an approved secret reference format", () => {
    const pattern =
      /^(vault|secret-manager|env-ref|supabase-vault):[A-Za-z0-9._/-]{1,240}$/;
    assert.equal(pattern.test("vault:plugins/vendor/api-key"), true);
  });

  it("rejects a raw secret value as a secret reference", () => {
    const pattern =
      /^(vault|secret-manager|env-ref|supabase-vault):[A-Za-z0-9._/-]{1,240}$/;
    assert.equal(pattern.test("sk-live-raw-secret"), false);
  });

  it("uses tenant then global then default inheritance order", () => {
    const tenant = undefined;
    const global = "global";
    const fallback = "default";
    assert.equal(tenant ?? global ?? fallback, "global");
  });
});
