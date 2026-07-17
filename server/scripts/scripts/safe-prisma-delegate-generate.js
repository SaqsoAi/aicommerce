const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const serverRoot = process.cwd();
const schemaPath = path.join(serverRoot, "prisma", "schema.prisma");
const envPath = path.join(serverRoot, ".env");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    value = value.replace(/^["']|["']$/g, "");

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function run(label, command, args) {
  console.log("");
  console.log("--------------------------------------------------");
  console.log(label);
  console.log("--------------------------------------------------");

  const result = spawnSync(command, args, {
    cwd: serverRoot,
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      PRISMA_SCHEMA_PATH: schemaPath,
    },
  });

  if (result.status !== 0) {
    console.error(`${label} failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }
}

if (!fs.existsSync(schemaPath)) {
  console.error(`schema.prisma not found: ${schemaPath}`);
  process.exit(1);
}

loadDotEnv(envPath);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Check server/.env");
  process.exit(1);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

run("Prisma Format", npx, ["prisma", "format", "--schema", schemaPath]);
run("Prisma Generate", npx, ["prisma", "generate", "--schema", schemaPath]);
run("Prisma Db Push", npx, ["prisma", "db", "push", "--schema", schemaPath, "--accept-data-loss"]);