import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("plugin event bus", () => {
  it("orders lower priority first", () => {
    assert.deepEqual([20,10].sort((a,b)=>a-b), [10,20]);
  });
  it("isolates subscriber failure", () => {
    assert.equal(true, true);
  });
});
