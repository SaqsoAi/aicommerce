export type DashboardActionResult = { type: "navigate"; route: string } | { type: "setup"; title: string; steps: string[]; route?: string };
const liveRoutes = new Set(["/dashboard","/analytics","/products","/orders","/customers","/coupons","/roles","/settings","/notifications","/ai-development-copilot","/ai-code-reviewer","/ai-performance"]);
export function resolveDashboardAction(route: string | undefined, title: string): DashboardActionResult {
  if (route && liveRoutes.has(route)) return { type: "navigate", route };
  return { type: "setup", title, route, steps: ["Create or verify the target route.", "Connect backend API and permission guard.", "Add audit logging.", "Retest role-based access and build."] };
}
