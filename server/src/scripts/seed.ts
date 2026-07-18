import { existsSync } from "fs";
import path from "path";
import { spawnSync } from "child_process";

const scripts = [
  "seed-customer-profile-fields.ts",
  "seed-purchase-flow.ts",
  "seed-rewards.ts",
  "seed-size-fit-center.ts",
  "seed-subcategories-from-purchase.ts",
  "seed-role-demo-users.ts",
];

console.log("");
console.log("==================================");
console.log(" AI-COMMERCE MASTER SEED");
console.log("==================================");

for (const file of scripts) {
  const full = path.join(__dirname, file);

  if (!existsSync(full)) {
    console.log("SKIP :", file);
    continue;
  }

  console.log("RUN  :", file);

  const result = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["ts-node", full],
    {
      stdio: "inherit",
      shell: false,
      cwd: path.resolve(__dirname, "../.."),
      env: process.env,
    }
  );

  if (result.status !== 0) {
    console.error("FAILED:", file);
    process.exit(result.status ?? 1);
  }

  console.log("DONE :", file);
}

console.log("");
console.log("MASTER SEED COMPLETE");