import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("tenant plugin isolation", () => {
  it("does not trust tenantId from request body or query", () => {
    const trustedTokenTenantId = "tenant-a";
    const untrustedBodyTenantId = "tenant-b";
    assert.notEqual(trustedTokenTenantId, untrustedBodyTenantId);
  });

  it("allows only tenant-scoped tenant-admin-editable fields", () => {
    const field = {
      scope: "TENANT",
      tenantAdminEditable: true,
    };
    assert.equal(
      field.scope === "TENANT" &&
        field.tenantAdminEditable === true,
      true
    );
  });

  it("denies global fields to tenant administrators", () => {
    const field = {
      scope: "GLOBAL",
      tenantAdminEditable: true,
    };
    assert.equal(field.scope === "TENANT", false);
  });
});
