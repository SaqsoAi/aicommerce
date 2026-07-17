import { execFileSync } from "child_process";
export function deploymentPlan() {
  return { stages: ["backup", "validate environment", "install plugin", "rebuild", "smoke test", "approve release"], rollback: ["restore transaction backup", "regenerate Prisma client if schema changed", "rebuild affected apps"] };
}
export function runBuild(root: string, app: "server" | "admin" | "client") {
  try {
    const output = execFileSync(process.platform === "win32" ? "cmd.exe" : "npm", process.platform === "win32" ? ["/d", "/s", "/c", `cd /d "${root}\\${app}" && npm run build 2>&1`] : ["run", "build"], { encoding: "utf8", timeout: 600000, cwd: process.platform === "win32" ? undefined : `${root}/${app}` });
    return { app, passed: true, output };
  } catch (error: any) {
    return { app, passed: false, output: String(error?.stdout ?? error?.message ?? error) };
  }
}
