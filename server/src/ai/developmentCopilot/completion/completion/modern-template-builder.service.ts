type TemplateRequest = {
  name?: string;
  kind?: "storefront" | "dashboard" | "landing";
  sections?: string[];
  tenantAware?: boolean;
};

export function modernTemplateBlueprint(input: TemplateRequest) {
  const kind = input.kind ?? "storefront";
  const defaults = kind === "dashboard"
    ? ["Header", "KPI Grid", "Charts", "Activity", "Action Center"]
    : kind === "landing"
      ? ["Announcement", "Header", "Hero", "Benefits", "CTA", "Footer"]
      : ["Announcement", "Header", "Hero", "Categories", "Products", "Cart", "Footer"];

  return {
    name: input.name ?? "SAQSO Modern Template",
    kind,
    sections: input.sections?.length ? input.sections : defaults,
    runtime: {
      tenantAware: input.tenantAware !== false,
      themeResolver: true,
      cmsResolver: true,
      responsive: true,
      accessibility: true,
    },
    status: "BLUEPRINT",
    approvalRequired: true,
  };
}
