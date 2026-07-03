import { adminNavigation, type AdminNavGroup, type AdminNavItem, type AdminRole } from "./navigation";

export function flattenAdminNavigation(groups: AdminNavGroup[] = adminNavigation): AdminNavItem[] {
  return groups.flatMap((group) => group.items);
}

export function filterAdminNavigationByRole(
  role: AdminRole | string | null | undefined,
  groups: AdminNavGroup[] = adminNavigation
): AdminNavGroup[] {
  const safeRole = role as AdminRole | undefined;

  return groups
    .map((group) => {
      if (safeRole && group.roles && !group.roles.includes(safeRole)) {
        return null;
      }

      const items = group.items.filter((item) => {
        return !safeRole || !item.roles || item.roles.includes(safeRole);
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