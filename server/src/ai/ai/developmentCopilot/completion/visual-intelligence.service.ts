import fs from "fs";

export function auditUiFile(file: string) {
  const text = fs.readFileSync(file, "utf8");
  const gaps: string[] = [];
  if (/<form/.test(text) && !/aria-|htmlFor=/.test(text)) gaps.push("Form accessibility labels may be incomplete");
  if (/<button/.test(text) && !/disabled=/.test(text)) gaps.push("Submit/loading disabled state may be missing");
  if (/#[0-9a-fA-F]{3,8}\b/.test(text)) gaps.push("Hard-coded color detected; verify design token");
  if (!/@media|sm:|md:|lg:/.test(text)) gaps.push("Responsive behavior not visible in this file");
  if (!/dark:/.test(text) && /className/.test(text)) gaps.push("Dark-mode coverage not visible");
  return { file, gaps, score: Math.max(0, 100 - gaps.length * 15) };
}

export function templateBlueprint(input: Record<string, unknown>) {
  return {
    name: String(input.name ?? "Modern Ecommerce"),
    sections: ["Announcement", "Header", "Hero", "Category Navigation", "Product Grid", "Product Detail", "Cart", "Checkout", "Account", "Footer"],
    requirements: ["tenant resolver", "theme resolver", "CMS resolver", "responsive matrix", "dark/light validation", "accessibility"],
  };
}
