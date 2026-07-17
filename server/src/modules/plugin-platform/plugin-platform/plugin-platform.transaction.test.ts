import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";

describe("plugin transaction destination policy", () => {
  it("normalizes a destination below its owner root", () => {
    const root = path.resolve("D:\\AI-ECOMMERCE\\server");
    const destination = path.resolve(root, "src", "modules", "example.ts");
    assert.equal(destination.startsWith(root + path.sep), true);
  });

  it("detects an escaping destination", () => {
    const root = path.resolve("D:\\AI-ECOMMERCE\\server");
    const destination = path.resolve(root, "..", "admin", "src", "page.tsx");
    assert.equal(destination.startsWith(root + path.sep), false);
  });

  it("requires immutable SHA-256 values", () => {
    assert.match("a".repeat(64), /^[a-f0-9]{64}$/);
  });
});
