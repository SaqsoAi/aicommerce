import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  safeRelativePath,
  validateManifest,
} from "./plugin-platform.validation";

describe("plugin platform lifecycle input safety", () => {
  it("accepts a normalized relative plugin path", () => {
    assert.equal(
      safeRelativePath("payload/server/src/modules/example/index.ts"),
      true
    );
  });

  it("rejects parent traversal", () => {
    assert.equal(safeRelativePath("../server/src/app.ts"), false);
  });

  it("rejects Windows drive paths", () => {
    assert.equal(
      safeRelativePath("C:/Windows/System32/config/SAM"),
      false
    );
  });

  it("rejects a manifest with an unsupported schema version", () => {
    const result = validateManifest({
      schemaVersion: "9.9",
      pluginKey: "example.plugin",
      version: "1.0.0",
      minimumPlatformVersion: "1.0.0",
      maximumPlatformVersion: "2.0.0",
      files: [],
    });

    assert.equal(result.manifest, undefined);
    assert.equal(
      result.issues.some((issue) => issue.code === "PKG_MANIFEST_SCHEMA"),
      true
    );
  });
});
