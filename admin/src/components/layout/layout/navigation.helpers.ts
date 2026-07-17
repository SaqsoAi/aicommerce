import { adminNavigation, type AdminNavGroup, type AdminNavItem, type AdminRole } from "./navigation";


function permissionForHref(href: string): string[] {
  if (href === "/dashboard") return ["dashboard.view"];
  if (href.startsWith("/analytics") || href.startsWith("/reports")) return ["analytics.view"];
  if (href.startsWith("/products")) return ["products.manage"];
  if (href.startsWith("/categories") || href.startsWith("/sub-categories")) return ["categories.manage"];
  if (href.startsWith("/brands")) return ["brands.manage"];
  if (href.startsWith("/inventory") || href.startsWith("/stock-")) return ["inventory.manage"];
  if (href.startsWith("/orders")) return ["orders.manage"];
  if (href.startsWith("/returns") || href.startsWith("/refund")) return ["returns.manage"];
  if (href.startsWith("/customers")) return ["customers.manage"];
  if (href.startsWith("/reviews")) return ["reviews.manage"];
  if (href.startsWith("/campaign") || href.startsWith("/marketing") || href.startsWith("/coupon")) return ["marketing.manage"];
  if (
    href.startsWith("/homepage") ||
    href.startsWith("/landing") ||
    href.startsWith("/media") ||
    href.startsWith("/lookbook")
  ) return ["cms.manage", "lookbooks.manage"];
  if (href.startsWith("/template")) return ["templates.view"];
  if (href.startsWith("/store-settings") || href.startsWith("/enterprise-store-settings")) return ["store.settings"];
  if (href.startsWith("/ai-")) return ["ai.features.use"];
  return [];
}

export function flattenAdminNavigation(groups: AdminNavGroup[] = adminNavigation): AdminNavItem[] {
  return groups.flatMap((group) => group.items);
}

export function filterAdminNavigationByRole(
  role: AdminRole | string | null | undefined,
  groups: AdminNavGroup[] = adminNavigation,
  permissions: string[] = [],
): AdminNavGroup[] {
  const safeRole = role as AdminRole | undefined;

  return groups
    .map((group) => {
      if (safeRole && group.roles && !group.roles.includes(safeRole)) {
        return null;
      }

      const permissionSet = new Set(permissions);
      const enforcePermissions =
        safeRole !== "SUPER_ADMIN" && permissionSet.size > 0;

      const items = group.items.filter((item) => {
        const roleAllowed = !safeRole || !item.roles || item.roles.includes(safeRole);
        if (!roleAllowed) return false;
        if (!enforcePermissions) return true;

        const required = item.permissionAnyOf ?? permissionForHref(item.href);
        return !required.length || required.some((permission) => permissionSet.has(permission));
      });

      if (!items.length) {
        return null;
      }

      return { ...group, items };
    })
    .filter(Boolean) as AdminNavGroup[];
}

export function searchAdminNavigation(query: string, groups: AdminNavGroup[] = adminNavigation): AdminNavItem[] {
  const q = query.trim().toLowerCase();

  if (!q) {
    return flattenAdminNavigation(groups);
  }

  return flattenAdminNavigation(groups).filter((item) => {
    const haystack = [item.name, item.label, item.href, item.section, item.group, ...(item.keywords || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function getAdminBreadcrumb(pathname: string, groups: AdminNavGroup[] = adminNavigation) {
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/dashboard";

  for (const group of groups) {
    const match = group.items.find((item) => {
      const href = item.href.replace(/\/$/, "");
      return cleanPath === href || cleanPath.startsWith(`${href}/`);
    });

    if (match) {
      return {
        group: group.label,
        section: group.section,
        page: match.label,
        href: match.href,
      };
    }
  }

  return {
    group: "Admin",
    section: "Admin",
    page: "Dashboard",
    href: "/dashboard",
  };
}

export function isAdminNavActive(pathname: string, href: string) {
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/dashboard";
  const cleanHref = href.replace(/\/$/, "");

  if (cleanHref === "/dashboard") {
    return cleanPath === "/dashboard" || cleanPath === "/";
  }

  return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
}
export function getAdminNavGroupByPath(pathname: string, groups: AdminNavGroup[] = adminNavigation) {
  const breadcrumb = getAdminBreadcrumb(pathname, groups);
  return groups.find((group) => group.label === breadcrumb.group || group.section === breadcrumb.section) || null;
}