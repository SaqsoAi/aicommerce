const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const serverRoot = process.cwd();
const schemaPath = path.join(serverRoot, "prisma", "schema.prisma");
const envPath = path.join(serverRoot, ".env");

function loadEnv() {
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    value = value.replace(/^["']|["']$/g, "");

    if (key && !process.env[key]) process.env[key] = value;
  }
}

function run(label, command, args) {
  console.log("");
  console.log("====================================================");
  console.log(label);
  console.log("====================================================");
  console.log(command, args.join(" "));

  const result = cp.spawnSync(command, args, {
    cwd: serverRoot,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  if (result.status !== 0) {
    console.error(`${label} failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }
}

if (!fs.existsSync(schemaPath)) {
  console.error("schema.prisma not found:", schemaPath);
  process.exit(1);
}

loadEnv();

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

run("npm install to restore missing Prisma client package files", "npm.cmd", ["install"]);

run("Prisma validate", npx, ["prisma", "validate", "--schema", schemaPath]);

run("Prisma format", npx, ["prisma", "format", "--schema", schemaPath]);

run("Prisma generate", npx, ["prisma", "generate", "--schema", schemaPath]);