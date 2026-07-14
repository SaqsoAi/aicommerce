"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./MigrationStudioFoundation.module.css";
import AiCapabilityDiscoveryPanel from "./AiCapabilityDiscoveryPanel";

type ZipEntry = {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  flags: number;
  localHeaderOffset: number;
};

type SelectItem = { id: string; name: string; slug?: string; tenantId?: string };
type RouteInfo = { path: string; component: string; sourceImport?: string };
type AdminCapability = {
  key: string;
  label: string;
  fields: string[];
  existingRoute?: string;
  status: "REUSE" | "GENERATE";
};
type CoverageStatus = "READY" | "REUSE" | "GENERATE" | "MANUAL";
type FeatureCoverage = {
  key: string;
  label: string;
  client: CoverageStatus;
  admin: CoverageStatus;
  api: CoverageStatus;
  permission: CoverageStatus;
  database: CoverageStatus;
  ai: CoverageStatus;
  overall: number;
  notes: string[];
};
type DiscoveryStatus = "PRESENT" | "PARTIAL" | "MISSING" | "BROKEN" | "UNCONNECTED";
type PageDiscovery = { key: string; label: string; status: DiscoveryStatus; score: number; evidence: string[]; gaps: string[] };
type ComponentDiscovery = { key: string; label: string; status: "PRESENT" | "PARTIAL" | "MISSING"; evidence: string[] };
type FeatureDiscovery = { key: string; label: string; status: "PRESENT" | "PARTIAL" | "MISSING" | "UNCONNECTED"; evidence: string[] };
type VisualFidelity = {
  score: number;
  status: "PASS" | "REVIEW" | "BLOCKED";
  cssFiles: number;
  styleSystems: string[];
  colors: number;
  fontFamilies: number;
  mediaQueries: number;
  animations: number;
  globalLeakRisks: string[];
  responsiveDecision: "PRESERVE" | "REPAIR" | "GENERATE";
  checks: { label: string; status: "PASS" | "REVIEW" | "BLOCKED"; detail: string }[];
};


type ValidationGateStatus = "PASS" | "REVIEW" | "BLOCKED";
type ValidationGate = {
  key: string;
  label: string;
  status: ValidationGateStatus;
  detail: string;
};
type ValidationCertification = {
  score: number;
  status: "CERTIFIED" | "REVIEW_REQUIRED" | "BLOCKED";
  publishReady: boolean;
  gates: ValidationGate[];
  requiredActions: string[];
};

type QualitySummary = {
  projectType: string;
  completeness: number;
  designCompleteness: number;
  dataBinding: number;
  interaction: number;
  responsive: number;
  classification: "COMPLETE" | "PARTIAL" | "INCOMPLETE";
  difficulty: "EASY" | "MEDIUM" | "HARD" | "ENTERPRISE";
};

type Analysis = {
  framework: string;
  pages: string[];
  missing: string[];
  ai: string[];
  responsive: "PRESERVE" | "REPAIR" | "GENERATE";
  hasDb: boolean;
  entries: ZipEntry[];
  routes: RouteInfo[];
  sourceRoot: string;
  adminManagement: AdminCapability[];
  coverage: FeatureCoverage[];
  pageDiscovery: PageDiscovery[];
  componentDiscovery: ComponentDiscovery[];
  featureDiscovery: FeatureDiscovery[];
  quality: QualitySummary;
  visualFidelity: VisualFidelity;
};

type MappingAction = "REUSE" | "CONNECT" | "MERGE" | "CONVERT" | "GENERATE" | "IGNORE" | "BLOCK";
type MappingDecision = {
  id: string;
  area: "PAGE" | "COMPONENT" | "FEATURE" | "ADMIN" | "API" | "AI" | "RESPONSIVE";
  label: string;
  action: MappingAction;
  confidence: number;
  reason: string;
  output: string;
};
type CompletionPlan = {
  decisions: MappingDecision[];
  blockers: string[];
  warnings: string[];
  simulation: {
    reuse: number;
    connect: number;
    merge: number;
    convert: number;
    generate: number;
    block: number;
    adminModules: number;
    apiAdapters: number;
    aiFeatures: number;
    responsiveRepairs: number;
    powerShellRequired: boolean;
    risk: "LOW" | "MEDIUM" | "HIGH";
  };
  steps: string[];
};

function clampConfidence(value: number): number {
  return Math.max(1, Math.min(99, Math.round(value)));
}

function buildCompletionPlan(analysis: Analysis): CompletionPlan {
  const decisions: MappingDecision[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  for (const page of analysis.pageDiscovery) {
    let action: MappingAction = "REUSE";
    let reason = "Complete page detected and can be retained.";
    let output = "Keep the source page and map it into the migrated route.";
    let confidence = page.score;

    if (page.status === "MISSING") {
      action = "GENERATE";
      reason = "Required page was not found in the imported project.";
      output = "Generate or reuse the current platform page using the imported theme.";
      confidence = 96;
    } else if (page.status === "PARTIAL" || page.status === "BROKEN") {
      action = "MERGE";
      reason = `${page.status.toLowerCase()} page requires missing sections or interaction repair.`;
      output = "Merge source design with current platform components and repair only detected gaps.";
      confidence = Math.max(76, page.score);
    } else if (page.status === "UNCONNECTED") {
      action = "CONNECT";
      reason = "Page exists but real API/data connection was not detected.";
      output = "Connect the page to the current platform API through an adapter.";
      confidence = 91;
    }

    decisions.push({
      id: `page:${page.key}`,
      area: "PAGE",
      label: page.label,
      action,
      confidence: clampConfidence(confidence),
      reason,
      output,
    });
  }

  for (const component of analysis.componentDiscovery) {
    const action: MappingAction =
      component.status === "MISSING" ? "GENERATE" :
      component.status === "PARTIAL" ? "MERGE" :
      "REUSE";
    decisions.push({
      id: `component:${component.key}`,
      area: "COMPONENT",
      label: component.label,
      action,
      confidence: action === "REUSE" ? 95 : action === "MERGE" ? 84 : 92,
      reason:
        action === "REUSE"
          ? "Reusable component evidence exists in the source."
          : action === "MERGE"
            ? "Component is present but incomplete."
            : "Required component was not found.",
      output:
        action === "REUSE"
          ? "Retain source component unless a platform-owned equivalent provides required business logic."
          : action === "MERGE"
            ? "Repair the component using platform design and behavior contracts."
            : "Generate a theme-compatible component or reuse the platform equivalent.",
    });
  }

  for (const feature of analysis.featureDiscovery) {
    const coverage = analysis.coverage.find((item) => item.key === feature.key);
    let action: MappingAction = "CONNECT";
    let confidence = 90;
    let reason = "Feature detected; connect it to current platform capability.";
    let output = "Reuse current API, permission and tenant/store scope.";

    if (feature.status === "MISSING") {
      action = "GENERATE";
      confidence = 82;
      reason = "Expected feature was not detected in the imported project.";
      output = "Preserve the current platform feature and add a theme-compatible client surface when required.";
    } else if (feature.status === "PARTIAL") {
      action = "MERGE";
      confidence = 79;
      reason = "Feature exists only partially.";
      output = "Merge imported UI with existing platform services and complete missing layers.";
    } else if (feature.status === "UNCONNECTED") {
      action = "CONNECT";
      confidence = 94;
      reason = "Feature UI exists without verified real-data binding.";
      output = "Generate an API adapter and runtime validation gate.";
    }

    if (coverage?.api === "MANUAL" || coverage?.database === "MANUAL") {
      warnings.push(`${feature.label}: API or database binding requires review.`);
      confidence -= 12;
    }
    if (coverage?.ai === "GENERATE") {
      output += " Implement the missing AI capability using the current AI gateway/provider architecture.";
    }

    decisions.push({
      id: `feature:${feature.key}`,
      area: feature.key.toLowerCase().includes("ai") ? "AI" : "FEATURE",
      label: feature.label,
      action,
      confidence: clampConfidence(confidence),
      reason,
      output,
    });
  }

  for (const management of analysis.adminManagement) {
    decisions.push({
      id: `admin:${management.key}`,
      area: "ADMIN",
      label: management.label,
      action: management.status === "REUSE" ? "CONNECT" : "GENERATE",
      confidence: management.status === "REUSE" ? 98 : 91,
      reason:
        management.status === "REUSE"
          ? `Existing management route is available: ${management.existingRoute}.`
          : "Required Admin management was not detected.",
      output:
        management.status === "REUSE"
          ? "Connect the migrated feature to the existing management module."
          : `Generate list/create/edit management with fields: ${management.fields.join(", ")}.`,
    });
  }

  decisions.push({
    id: "responsive:project",
    area: "RESPONSIVE",
    label: "Responsive behavior",
    action: analysis.responsive === "PRESERVE" ? "REUSE" : analysis.responsive === "REPAIR" ? "MERGE" : "GENERATE",
    confidence: analysis.responsive === "PRESERVE" ? 96 : analysis.responsive === "REPAIR" ? 87 : 83,
    reason:
      analysis.responsive === "PRESERVE"
        ? "Responsive foundation was detected."
        : analysis.responsive === "REPAIR"
          ? "Responsive foundation exists but broken viewports were detected."
          : "No reliable responsive foundation was detected.",
    output:
      analysis.responsive === "PRESERVE"
        ? "Keep current responsive behavior unchanged."
        : analysis.responsive === "REPAIR"
          ? "Repair only broken viewports across the required matrix."
          : "Generate responsive rules for 320–1920px viewports.",
  });

  if (/unknown|unsupported/i.test(analysis.framework)) {
    blockers.push("Unsupported or unknown framework requires developer review.");
  }
  const lowConfidence = decisions.filter((item) => item.confidence < 70);
  if (lowConfidence.length) blockers.push(`${lowConfidence.length} mapping decisions are below the 70% confidence gate.`);
  if (analysis.entries.length > 20_000) warnings.push("Large archive: sandbox build and manual performance review are required.");
  if (analysis.quality.completeness < 45) warnings.push("Source project is highly incomplete; generated output will require extended review.");

  const count = (action: MappingAction) => decisions.filter((item) => item.action === action).length;
  const adminModules = decisions.filter((item) => item.area === "ADMIN" && item.action === "GENERATE").length;
  const apiAdapters = decisions.filter((item) => item.action === "CONNECT" && /API|data/i.test(`${item.reason} ${item.output}`)).length;
  const aiFeatures = decisions.filter((item) => item.area === "AI" && item.action !== "REUSE").length;
  const responsiveRepairs = decisions.filter((item) => item.area === "RESPONSIVE" && item.action !== "REUSE").length;
  const powerShellRequired = analysis.hasDb || analysis.coverage.some((item) => item.database === "MANUAL" || item.database === "GENERATE");
  const work = count("GENERATE") * 3 + count("MERGE") * 2 + count("CONNECT") + adminModules * 2 + (powerShellRequired ? 4 : 0);
  const risk: "LOW" | "MEDIUM" | "HIGH" = blockers.length || work > 45 ? "HIGH" : work > 20 ? "MEDIUM" : "LOW";

  return {
    decisions,
    blockers,
    warnings,
    simulation: {
      reuse: count("REUSE"),
      connect: count("CONNECT"),
      merge: count("MERGE"),
      convert: count("CONVERT"),
      generate: count("GENERATE"),
      block: count("BLOCK"),
      adminModules,
      apiAdapters,
      aiFeatures,
      responsiveRepairs,
      powerShellRequired,
      risk,
    },
    steps: [
      "Reuse platform-owned routes, components, APIs and Admin modules.",
      "Convert imported JS/JSX and framework-specific routes to current TypeScript/Next.js conventions.",
      "Merge partial pages and components without redesigning complete source sections.",
      "Generate missing pages, components and Admin management forms.",
      "Connect current real APIs through adapters and preserve tenant/store isolation.",
      "Implement imported AI features that are missing from the current platform.",
      "Apply responsive preserve/repair/generate decision across the viewport matrix.",
      powerShellRequired
        ? "Generate a separate PowerShell package for approved database/schema work."
        : "No database/schema package is currently required.",
      "Generate a DRAFT code-only Plugin ZIP and require sandbox validation before install.",
    ],
  };
}

type GeneratedFile = { path: string; content: Uint8Array };
type DraftCodeFile = {
  owner: "admin" | "client" | "server";
  path: string;
  operation: "create" | "replace";
  category: "PAGE" | "COMPONENT" | "ADMIN" | "API" | "METADATA" | "ASSET";
  sizeBytes: number;
  status: "GENERATED" | "REUSED" | "MERGED";
};
type RunState = "IDLE" | "ANALYZED" | "RUNNING" | "DONE" | "FAILED";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const REQUIRED = [
  "home",
  "login",
  "register",
  "product-list",
  "product-detail",
  "category",
  "search",
  "cart",
  "checkout",
  "wishlist",
  "account",
  "orders",
  "lookbook",
  "404",
];
const TEXT_EXT = /\.(tsx?|jsx?|css|scss|sass|less|json|html?|blade\.php|php|md|yml|yaml|env\.example)$/i;
const SOURCE_EXT = /\.(tsx?|jsx?|css|scss|sass|less|json|html?|svg|png|jpe?g|webp|gif|woff2?|ttf|otf)$/i;
const MAX_ENTRIES = 50_000;
const MAX_EXPANDED = 2 * 1024 * 1024 * 1024;

const EXISTING_ADMIN_MANAGEMENT: Record<string, string> = {
  products: "/products",
  categories: "/categories",
  brands: "/brands",
  orders: "/orders",
  inventory: "/inventory",
  campaigns: "/campaigns",
  coupons: "/coupons",
  wishlist: "/wishlist",
  reviews: "/reviews",
  membership: "/membership",
  rewards: "/rewards",
  lookbooks: "/lookbooks",
  homepage: "/homepage-builder",
};

const ADMIN_RULES: Array<{ key: string; label: string; pattern: RegExp; fields: string[] }> = [
  { key: "products", label: "Product Management", pattern: /product|catalog/, fields: ["name", "slug", "description", "categoryId", "brandId", "price", "salePrice", "sku", "stock", "images", "status"] },
  { key: "categories", label: "Category Management", pattern: /categor/, fields: ["name", "slug", "description", "parentId", "image", "sortOrder", "status"] },
  { key: "brands", label: "Brand Management", pattern: /brand/, fields: ["name", "slug", "logo", "description", "website", "status"] },
  { key: "orders", label: "Order Management", pattern: /order|checkout/, fields: ["customerId", "items", "shippingAddress", "billingAddress", "paymentStatus", "fulfillmentStatus", "notes"] },
  { key: "inventory", label: "Inventory Management", pattern: /inventory|stock|warehouse/, fields: ["productId", "variantId", "quantity", "warehouseId", "reorderLevel", "status"] },
  { key: "campaigns", label: "Campaign Management", pattern: /campaign|flash-sale|promotion/, fields: ["name", "slug", "startAt", "endAt", "banner", "products", "discountType", "discountValue", "status"] },
  { key: "coupons", label: "Coupon Management", pattern: /coupon|promo-code|discount/, fields: ["code", "description", "type", "value", "minimumOrder", "startsAt", "endsAt", "usageLimit", "status"] },
  { key: "wishlist", label: "Wishlist Management", pattern: /wishlist|favorite/, fields: ["customerId", "productId", "status"] },
  { key: "reviews", label: "Review Moderation", pattern: /review|rating|testimonial/, fields: ["productId", "customerId", "rating", "title", "content", "moderationStatus", "featured"] },
  { key: "membership", label: "Membership Management", pattern: /membership|member|subscription/, fields: ["name", "tier", "price", "benefits", "duration", "status"] },
  { key: "rewards", label: "Rewards Management", pattern: /reward|points|loyalty/, fields: ["name", "points", "ruleType", "ruleValue", "startsAt", "endsAt", "status"] },
  { key: "lookbooks", label: "Lookbook Management", pattern: /lookbook|collection/, fields: ["title", "slug", "description", "coverImage", "products", "sortOrder", "publishedAt", "status"] },
  { key: "homepage", label: "Homepage Management", pattern: /homepage|hero|banner|section/, fields: ["title", "sectionType", "order", "configuration", "visibility", "status"] },
  { key: "ai-feature", label: "AI Feature Management", pattern: /openai|anthropic|gemini|assistant|copilot|recommendation|personalization|vision|try-on|tryon/, fields: ["name", "provider", "model", "promptKey", "featureFlag", "tenantScope", "storeScope", "enabled"] },
];

const PAGE_RULES: Array<{ key: string; label: string; pattern: RegExp; components: string[] }> = [
  { key: "home", label: "Home", pattern: /home|homepage|index|path=["']\/?["']/, components: ["header", "footer", "hero", "product-card"] },
  { key: "product-list", label: "Product Listing", pattern: /products?|catalog|shop/, components: ["product-card", "filter", "pagination"] },
  { key: "product-detail", label: "Product Details", pattern: /product-detail|product\/[:\[]|product-view/, components: ["image-gallery", "add-to-cart", "variant-selector"] },
  { key: "category", label: "Category", pattern: /categor(y|ies)/, components: ["product-card", "filter"] },
  { key: "search", label: "Search", pattern: /search/, components: ["search", "product-card", "empty-state"] },
  { key: "cart", label: "Cart", pattern: /cart|shopping-bag/, components: ["cart-item", "cart-summary"] },
  { key: "checkout", label: "Checkout", pattern: /checkout/, components: ["checkout-form", "order-summary"] },
  { key: "login", label: "Login", pattern: /login|signin/, components: ["login-form"] },
  { key: "register", label: "Register", pattern: /register|signup/, components: ["register-form"] },
  { key: "account", label: "Account", pattern: /account|profile|dashboard/, components: ["account-nav", "profile-form"] },
  { key: "orders", label: "Orders", pattern: /orders?|order-history/, components: ["order-list", "empty-state"] },
  { key: "wishlist", label: "Wishlist", pattern: /wishlist|favorites?/, components: ["product-card", "empty-state"] },
  { key: "lookbook", label: "Lookbook", pattern: /lookbook|collection/, components: ["lookbook-card"] },
  { key: "about", label: "About", pattern: /about/, components: ["header", "footer"] },
  { key: "contact", label: "Contact", pattern: /contact/, components: ["contact-form"] },
  { key: "blog", label: "Blog", pattern: /blog|article|journal/, components: ["article-card"] },
  { key: "404", label: "404 / Not Found", pattern: /404|not-found|notfound/, components: ["empty-state"] },
];

const COMPONENT_RULES: Array<{ key: string; label: string; pattern: RegExp }> = [
  { key: "header", label: "Header", pattern: /header|navbar|navigation/ },
  { key: "footer", label: "Footer", pattern: /footer/ },
  { key: "hero", label: "Hero", pattern: /hero|banner/ },
  { key: "product-card", label: "Product Card", pattern: /product[-_ ]?card/ },
  { key: "filter", label: "Filters", pattern: /filter|facets?/ },
  { key: "pagination", label: "Pagination", pattern: /pagination|page[-_ ]?nav/ },
  { key: "search", label: "Search", pattern: /search[-_ ]?(bar|box|input)?/ },
  { key: "image-gallery", label: "Image Gallery", pattern: /gallery|product[-_ ]?images?/ },
  { key: "add-to-cart", label: "Add to Cart", pattern: /add[-_ ]?to[-_ ]?cart/ },
  { key: "variant-selector", label: "Variant Selector", pattern: /variant|size[-_ ]?selector|color[-_ ]?selector/ },
  { key: "cart-item", label: "Cart Item", pattern: /cart[-_ ]?item/ },
  { key: "cart-summary", label: "Cart Summary", pattern: /cart[-_ ]?(summary|total)/ },
  { key: "checkout-form", label: "Checkout Form", pattern: /checkout[-_ ]?form|shipping[-_ ]?form|billing[-_ ]?form/ },
  { key: "order-summary", label: "Order Summary", pattern: /order[-_ ]?summary/ },
  { key: "login-form", label: "Login Form", pattern: /login[-_ ]?form|signin[-_ ]?form/ },
  { key: "register-form", label: "Register Form", pattern: /register[-_ ]?form|signup[-_ ]?form/ },
  { key: "account-nav", label: "Account Navigation", pattern: /account[-_ ]?(nav|menu|sidebar)/ },
  { key: "profile-form", label: "Profile Form", pattern: /profile[-_ ]?form/ },
  { key: "order-list", label: "Order List", pattern: /order[-_ ]?list|order[-_ ]?history/ },
  { key: "lookbook-card", label: "Lookbook Card", pattern: /lookbook[-_ ]?card|collection[-_ ]?card/ },
  { key: "contact-form", label: "Contact Form", pattern: /contact[-_ ]?form/ },
  { key: "article-card", label: "Article Card", pattern: /article[-_ ]?card|blog[-_ ]?card/ },
  { key: "empty-state", label: "Empty State", pattern: /empty[-_ ]?state|no[-_ ]?(data|results|items)/ },
  { key: "loading-state", label: "Loading State", pattern: /loading|skeleton|spinner/ },
  { key: "error-state", label: "Error State", pattern: /error[-_ ]?state|error[-_ ]?boundary/ },
];

const FEATURE_RULES: Array<{ key: string; label: string; pattern: RegExp; apiPattern: RegExp }> = [
  { key: "products", label: "Products", pattern: /product|catalog/, apiPattern: /fetch\(|axios|api.*product|product.*api/ },
  { key: "categories", label: "Categories", pattern: /categor(y|ies)/, apiPattern: /api.*categor|categor.*api/ },
  { key: "brands", label: "Brands", pattern: /brand/, apiPattern: /api.*brand|brand.*api/ },
  { key: "cart", label: "Cart", pattern: /cart|shopping-bag/, apiPattern: /api.*cart|cart.*api|addtocart/ },
  { key: "checkout", label: "Checkout", pattern: /checkout|payment/, apiPattern: /api.*checkout|api.*order|payment.*api/ },
  { key: "wishlist", label: "Wishlist", pattern: /wishlist|favorite/, apiPattern: /api.*wishlist|wishlist.*api/ },
  { key: "orders", label: "Orders", pattern: /orders?|order-history/, apiPattern: /api.*orders?|orders?.*api/ },
  { key: "reviews", label: "Reviews", pattern: /review|rating/, apiPattern: /api.*review|review.*api/ },
  { key: "lookbook", label: "Lookbook", pattern: /lookbook|collection/, apiPattern: /api.*lookbook|lookbook.*api|api.*collection/ },
  { key: "campaigns", label: "Campaigns", pattern: /campaign|flash-sale|promotion/, apiPattern: /api.*campaign|campaign.*api/ },
  { key: "membership", label: "Membership", pattern: /membership|subscription|member/, apiPattern: /api.*membership|membership.*api/ },
  { key: "rewards", label: "Rewards", pattern: /reward|loyalty|points/, apiPattern: /api.*reward|reward.*api/ },
  { key: "ai", label: "AI Features", pattern: /openai|anthropic|gemini|assistant|copilot|recommendation|personalization|vision|try-on|tryon/, apiPattern: /api.*ai|ai.*api|openai|anthropic|gemini/ },
];

function buildDiscovery(entries: ZipEntry[], sourceMap: Map<string, string>, responsiveAction: Analysis["responsive"]) {
  const names = entries.map((entry) => entry.name.toLowerCase()).join("\n");
  const text = Array.from(sourceMap.values()).join("\n");
  const lower = text.toLowerCase();
  const evidence = `${names}\n${lower}`;
  const placeholderSignals = (lower.match(/lorem ipsum|coming soon|placeholder|todo[:\s]|dummy data|mock(data)?|sample products?/g) || []).length;
  const deadActionSignals = (text.match(/onClick=\{?\(\)\s*=>\s*\{?\s*\}?\}?|href=["']#["']|javascript:void\(0\)/g) || []).length;
  const hardcodedSignals = (text.match(/const\s+(products|orders|categories|reviews|customers)\s*=\s*\[/gi) || []).length;
  const apiSignals = (text.match(/fetch\(|axios\.|useQuery\(|apiClient|NEXT_PUBLIC_API|VITE_API/gi) || []).length;

  const componentDiscovery: ComponentDiscovery[] = COMPONENT_RULES.map((rule) => {
    const matches = evidence.match(new RegExp(rule.pattern.source, "gi")) || [];
    return {
      key: rule.key,
      label: rule.label,
      status: matches.length > 1 ? "PRESENT" : matches.length === 1 ? "PARTIAL" : "MISSING",
      evidence: matches.slice(0, 3),
    };
  });
  const componentMap = new Map(componentDiscovery.map((item) => [item.key, item]));

  const pageDiscovery: PageDiscovery[] = PAGE_RULES.map((rule) => {
    const pageMatches = evidence.match(new RegExp(rule.pattern.source, "gi")) || [];
    if (!pageMatches.length) return { key: rule.key, label: rule.label, status: "MISSING", score: 0, evidence: [], gaps: ["Page or route was not detected"] };
    const gaps: string[] = [];
    let score = 100;
    for (const requiredComponent of rule.components) {
      const component = componentMap.get(requiredComponent);
      if (!component || component.status === "MISSING") { score -= 14; gaps.push(`${requiredComponent} missing`); }
      else if (component.status === "PARTIAL") { score -= 6; gaps.push(`${requiredComponent} only partially detected`); }
    }
    if (placeholderSignals) { score -= Math.min(18, placeholderSignals * 3); gaps.push("Placeholder/demo content detected"); }
    if (deadActionSignals) { score -= Math.min(15, deadActionSignals * 3); gaps.push("Dead or empty interaction detected"); }
    if (hardcodedSignals) { score -= Math.min(18, hardcodedSignals * 4); gaps.push("Hardcoded business data detected"); }
    if (responsiveAction !== "PRESERVE") { score -= responsiveAction === "REPAIR" ? 8 : 16; gaps.push(`Responsive action required: ${responsiveAction}`); }
    score = Math.max(0, Math.min(100, score));
    const status: DiscoveryStatus = score >= 90 ? "PRESENT" : score >= 55 ? "PARTIAL" : "BROKEN";
    return { key: rule.key, label: rule.label, status, score, evidence: pageMatches.slice(0, 4), gaps: Array.from(new Set(gaps)) };
  });

  const featureDiscovery: FeatureDiscovery[] = FEATURE_RULES.map((rule) => {
    const present = rule.pattern.test(evidence);
    const connected = rule.apiPattern.test(lower);
    return {
      key: rule.key,
      label: rule.label,
      status: !present ? "MISSING" : connected ? "PRESENT" : "UNCONNECTED",
      evidence: [present ? "Feature UI/source signal detected" : "No feature signal", connected ? "API/data signal detected" : "No API/data binding signal"],
    };
  });

  const pageScores = pageDiscovery.map((item) => item.score);
  const completeness = Math.round(pageScores.reduce((sum, score) => sum + score, 0) / Math.max(1, pageScores.length));
  const designCompleteness = Math.max(0, Math.min(100, 100 - placeholderSignals * 4 - deadActionSignals * 3));
  const dataBinding = Math.min(100, apiSignals * 12);
  const interaction = Math.max(0, Math.min(100, 100 - deadActionSignals * 12));
  const responsive = responsiveAction === "PRESERVE" ? 100 : responsiveAction === "REPAIR" ? 70 : 35;
  const totalSignals = entries.length + sourceMap.size + pageDiscovery.length * 5;
  const difficulty: QualitySummary["difficulty"] = totalSignals > 5000 ? "ENTERPRISE" : totalSignals > 1800 ? "HARD" : totalSignals > 500 ? "MEDIUM" : "EASY";
  const classification: QualitySummary["classification"] = completeness >= 90 ? "COMPLETE" : completeness >= 70 ? "PARTIAL" : "INCOMPLETE";
  const quality: QualitySummary = {
    projectType: /(product|cart|checkout|catalog|shop)/.test(evidence) ? "ECOMMERCE" : "GENERAL_WEB_APPLICATION",
    completeness,
    designCompleteness,
    dataBinding,
    interaction,
    responsive,
    classification,
    difficulty,
  };
  return { pageDiscovery, componentDiscovery, featureDiscovery, quality };
}

function coverageFor(capability: AdminCapability, aiSignals: string[], hasDbArtifacts: boolean): FeatureCoverage {
  const generated = capability.status === "GENERATE";
  const isAi = capability.key === "ai-feature";
  const statuses: CoverageStatus[] = [
    "READY",
    generated ? "GENERATE" : "REUSE",
    generated ? "GENERATE" : "REUSE",
    generated ? "GENERATE" : "READY",
    generated || hasDbArtifacts ? "MANUAL" : "READY",
    isAi ? (aiSignals.length ? (generated ? "GENERATE" : "REUSE") : "MANUAL") : "READY",
  ];
  const scoreMap: Record<CoverageStatus, number> = { READY: 100, REUSE: 100, GENERATE: 70, MANUAL: 35 };
  const overall = Math.round(statuses.reduce((total, status) => total + scoreMap[status], 0) / statuses.length);
  const notes: string[] = [];
  if (generated) notes.push("Admin UI, server contract and permission scaffolds will be generated in the DRAFT plugin.");
  if (generated || hasDbArtifacts) notes.push("Database compatibility must be confirmed through the separate PowerShell package before publish.");
  if (isAi && aiSignals.length) notes.push("Imported AI capability will be connected to the existing AI gateway where possible; provider configuration remains mandatory.");
  return {
    key: capability.key,
    label: capability.label,
    client: "READY",
    admin: statuses[1],
    api: statuses[2],
    permission: statuses[3],
    database: statuses[4],
    ai: statuses[5],
    overall,
    notes,
  };
}


function u16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}
function u32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

function parseZip(buffer: ArrayBuffer): ZipEntry[] {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const decoder = new TextDecoder();
  let end = -1;

  for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 65_557); index -= 1) {
    if (u32(view, index) === 0x06054b50) {
      end = index;
      break;
    }
  }
  if (end < 0) throw new Error("Valid ZIP central directory not found");

  const count = u16(view, end + 10);
  const directoryOffset = u32(view, end + 16);
  if (count > MAX_ENTRIES) throw new Error("Too many archive entries");

  const entries: ZipEntry[] = [];
  let pointer = directoryOffset;
  let total = 0;

  for (let index = 0; index < count; index += 1) {
    if (u32(view, pointer) !== 0x02014b50) throw new Error("Malformed ZIP directory");
    const flags = u16(view, pointer + 8);
    const compressionMethod = u16(view, pointer + 10);
    const compressedSize = u32(view, pointer + 20);
    const uncompressedSize = u32(view, pointer + 24);
    const nameLength = u16(view, pointer + 28);
    const extraLength = u16(view, pointer + 30);
    const commentLength = u16(view, pointer + 32);
    const localHeaderOffset = u32(view, pointer + 42);
    const name = decoder
      .decode(bytes.slice(pointer + 46, pointer + 46 + nameLength))
      .replace(/\\/g, "/");

    if (name.startsWith("/") || name.includes("../") || /^[A-Za-z]:\//.test(name)) {
      throw new Error(`Unsafe path: ${name}`);
    }
    if (!name.endsWith("/")) {
      total += uncompressedSize;
      if (total > MAX_EXPANDED) throw new Error("Expanded archive exceeds safety limit");
      entries.push({ name, compressedSize, uncompressedSize, compressionMethod, flags, localHeaderOffset });
    }
    pointer += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

async function extract(buffer: ArrayBuffer, entry: ZipEntry): Promise<Uint8Array> {
  if (entry.flags & 1) throw new Error(`Encrypted entry unsupported: ${entry.name}`);
  const view = new DataView(buffer);
  if (u32(view, entry.localHeaderOffset) !== 0x04034b50) throw new Error("Invalid local header");
  const start =
    entry.localHeaderOffset +
    30 +
    u16(view, entry.localHeaderOffset + 26) +
    u16(view, entry.localHeaderOffset + 28);
  const raw = new Uint8Array(buffer.slice(start, start + entry.compressedSize));
  if (entry.compressionMethod === 0) return raw;
  if (entry.compressionMethod === 8) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("Browser cannot decompress ZIP entries");
    }
    const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  throw new Error(`Unsupported ZIP compression method ${entry.compressionMethod}`);
}

function authHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function listApi(paths: string[]): Promise<SelectItem[]> {
  let lastError = "";
  for (const path of paths) {
    try {
      const response = await fetch(`${API}${path}`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        lastError = payload?.message || String(response.status);
        continue;
      }
      const raw = payload?.data ?? payload?.items ?? payload;
      const array = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
      return array.map((item: Record<string, unknown>) => ({
        id: String(item.id ?? item.key ?? item.slug),
        name: String(item.name ?? item.title ?? item.storeName ?? item.slug ?? item.id),
        slug: item.slug ? String(item.slug) : undefined,
      }));
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(lastError || "No compatible API endpoint responded");
}

function archiveRoot(entries: ZipEntry[]): string {
  const roots = new Set(entries.map((entry) => entry.name.split("/")[0]).filter(Boolean));
  return roots.size === 1 ? `${Array.from(roots)[0]}/` : "";
}

function detectRoutes(sourceMap: Map<string, string>): RouteInfo[] {
  const routes: RouteInfo[] = [];
  for (const [name, source] of sourceMap.entries()) {
    if (!/(routes?|app)\.(jsx?|tsx?)$/i.test(name)) continue;
    const imports = new Map<string, string>();
    const importPattern = /import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["']/g;
    let importMatch: RegExpExecArray | null;
    while ((importMatch = importPattern.exec(source))) imports.set(importMatch[1], importMatch[2]);

    const routePattern = /<Route\s+[^>]*path=["']([^"']+)["'][^>]*element=\{<([A-Za-z_$][\w$]*)\s*\/>\}[^>]*\/>/g;
    let routeMatch: RegExpExecArray | null;
    while ((routeMatch = routePattern.exec(source))) {
      routes.push({
        path: routeMatch[1],
        component: routeMatch[2],
        sourceImport: imports.get(routeMatch[2]),
      });
    }
  }
  return routes;
}

function buildVisualFidelity(entries: ZipEntry[], sourceMap: Map<string, string>, responsiveDecision: Analysis["responsive"]): VisualFidelity {
  const cssSources = Array.from(sourceMap.entries()).filter(([name]) => /\.(css|scss|sass|less)$/i.test(name));
  const cssText = cssSources.map(([, source]) => source).join("\n");
  const sourceText = Array.from(sourceMap.values()).join("\n");
  const styleSystems = new Set<string>();
  const names = entries.map((entry) => entry.name.toLowerCase()).join("\n");
  if (/tailwind/.test(names + sourceText.toLowerCase())) styleSystems.add("Tailwind CSS");
  if (/bootstrap/.test(names + sourceText.toLowerCase())) styleSystems.add("Bootstrap");
  if (/styled-components|@emotion/.test(sourceText.toLowerCase())) styleSystems.add("CSS-in-JS");
  if (/\.module\.(css|scss|sass|less)/i.test(names)) styleSystems.add("CSS Modules");
  if (/\.(scss|sass)/i.test(names)) styleSystems.add("Sass");
  if (/\.less/i.test(names)) styleSystems.add("Less");
  if (cssSources.length > 0 && styleSystems.size === 0) styleSystems.add("Plain CSS");

  const colorTokens = new Set((cssText.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi) || []).map((value) => value.toLowerCase()));
  const fontFamilies = new Set((cssText.match(/font-family\s*:\s*[^;}{]+/gi) || []).map((value) => value.replace(/^font-family\s*:\s*/i, "").trim()));
  const mediaQueries = (cssText.match(/@media\s*\(/gi) || []).length;
  const animations = (cssText.match(/@keyframes\s+[\w-]+|animation(?:-name)?\s*:/gi) || []).length;
  const globalLeakRisks: string[] = [];
  if (/(^|})\s*(html|body|\*)\s*[{,]/m.test(cssText)) globalLeakRisks.push("Global html/body/* selectors require template scoping.");
  if (/(^|})\s*\.container\s*[{,]/m.test(cssText)) globalLeakRisks.push("Generic .container selector may collide with the platform shell.");
  if (/!important/.test(cssText)) globalLeakRisks.push("!important rules require conflict review.");

  const checks: VisualFidelity["checks"] = [
    {
      label: "Source stylesheet inventory",
      status: cssSources.length > 0 ? "PASS" : "REVIEW",
      detail: cssSources.length > 0 ? `${cssSources.length} stylesheet files will be preserved and scoped.` : "No stylesheet file was detected; component-inline styles require review.",
    },
    {
      label: "Theme token preservation",
      status: colorTokens.size > 0 || fontFamilies.size > 0 ? "PASS" : "REVIEW",
      detail: `${colorTokens.size} color values and ${fontFamilies.size} font-family declarations detected.`,
    },
    {
      label: "Responsive behavior",
      status: responsiveDecision === "PRESERVE" ? "PASS" : "REVIEW",
      detail: responsiveDecision === "PRESERVE" ? "Existing responsive rules will be retained; only failing viewports may be repaired." : responsiveDecision === "REPAIR" ? "Responsive foundation exists but requires viewport repair." : "Responsive rules must be generated for the required viewport matrix.",
    },
    {
      label: "CSS isolation",
      status: globalLeakRisks.length === 0 ? "PASS" : "REVIEW",
      detail: globalLeakRisks.length === 0 ? "No obvious global CSS collision signal detected." : globalLeakRisks.join(" "),
    },
    {
      label: "Before/after certification",
      status: "REVIEW",
      detail: "Generated output remains DRAFT until source and migrated screenshots are compared at 320, 360, 390, 768, 1024, 1366, 1440 and 1920px.",
    },
  ];

  let score = 100;
  if (cssSources.length === 0) score -= 18;
  if (colorTokens.size === 0) score -= 8;
  if (fontFamilies.size === 0) score -= 5;
  if (responsiveDecision === "REPAIR") score -= 10;
  if (responsiveDecision === "GENERATE") score -= 20;
  score -= Math.min(18, globalLeakRisks.length * 6);
  score = Math.max(35, Math.min(99, score));

  return {
    score,
    status: score >= 90 && globalLeakRisks.length === 0 ? "PASS" : score >= 70 ? "REVIEW" : "BLOCKED",
    cssFiles: cssSources.length,
    styleSystems: Array.from(styleSystems),
    colors: colorTokens.size,
    fontFamilies: fontFamilies.size,
    mediaQueries,
    animations,
    globalLeakRisks,
    responsiveDecision,
    checks,
  };
}

function detect(entries: ZipEntry[], sourceMap: Map<string, string>): Analysis {
  const names = entries.map((entry) => entry.name.toLowerCase());
  const joinedNames = names.join("\n");
  const allText = Array.from(sourceMap.values()).join("\n").toLowerCase();
  let framework = "Static HTML";
  if (
    names.some((name) => name.endsWith("artisan")) ||
    (names.some((name) => name.endsWith("composer.json")) && joinedNames.includes("resources/views"))
  ) {
    framework = "Laravel";
  } else if (joinedNames.includes("next.config") || (joinedNames.includes("/app/") && names.some((name) => name.endsWith("package.json")))) {
    framework = "Next.js";
  } else if (joinedNames.includes("vite.config")) {
    framework = "React + Vite";
  } else if (joinedNames.includes("src/") && joinedNames.includes("package.json")) {
    framework = "React";
  }

  const routes = detectRoutes(sourceMap);
  const evidence = `${joinedNames}\n${routes.map((route) => route.path).join("\n")}`;
  const pages: string[] = [];
  const test = (key: string, pattern: RegExp) => {
    if (pattern.test(evidence)) pages.push(key);
  };
  test("home", /(^|\/)(home|homepage|index)(\/|\.|$)|path="?\/?"?/m);
  test("login", /(^|\/)(login|signin)(\/|\.|$)/);
  test("register", /(register|signup)/);
  test("product-list", /(product-catalog|products|catalog)(\/|\.|$)/);
  test("product-detail", /(product-detail|product\/\[|product\/show)/);
  test("category", /(category|categories)/);
  test("search", /search/);
  test("cart", /(shopping-cart|cart)/);
  test("checkout", /checkout/);
  test("wishlist", /(wishlist|favorites)/);
  test("account", /(user-account|account|profile|dashboard)/);
  test("orders", /(orders|order-history)/);
  test("lookbook", /(lookbook|collection)/);
  test("404", /(404|not-found|notfound)/);

  const aiTerms = [
    "openai",
    "anthropic",
    "gemini",
    "assistant",
    "copilot",
    "recommendation",
    "personalization",
    "visual-search",
    "try-on",
    "tryon",
    "vision",
    "langchain",
    "embedding",
    "rag",
    "ocr",
    "voice",
    "stylist",
    "agent",
    "workflow",
    "automation",
  ];
  const ai = aiTerms.filter((term) => allText.includes(term) || joinedNames.includes(term));
  const hasResponsiveCss = /@media\s*\(|\b(sm|md|lg|xl|2xl):/.test(allText);
  const hasResponsiveFramework = joinedNames.includes("tailwind") || joinedNames.includes("bootstrap");
  const responsive: Analysis["responsive"] = hasResponsiveCss
    ? "PRESERVE"
    : hasResponsiveFramework
      ? "REPAIR"
      : "GENERATE";
  const hasDb = names.some((name) =>
    /prisma\/schema\.prisma|database\/migrations|migrations\/.*\.(sql|php)|schema\.sql/.test(name),
  );
  const adminEvidence = `${joinedNames}
${allText}`;
  const adminManagement = ADMIN_RULES
    .filter((rule) => rule.pattern.test(adminEvidence))
    .map((rule) => ({
      key: rule.key,
      label: rule.label,
      fields: rule.fields,
      existingRoute: EXISTING_ADMIN_MANAGEMENT[rule.key],
      status: EXISTING_ADMIN_MANAGEMENT[rule.key] ? "REUSE" as const : "GENERATE" as const,
    }));
  const coverage = adminManagement.map((capability) => coverageFor(capability, ai, hasDb));
  const discovery = buildDiscovery(entries, sourceMap, responsive);
  const visualFidelity = buildVisualFidelity(entries, sourceMap, responsive);

  return {
    framework,
    pages: Array.from(new Set(pages)),
    missing: REQUIRED.filter((page) => !pages.includes(page)),
    ai: Array.from(new Set(ai)),
    responsive,
    hasDb,
    entries,
    routes,
    sourceRoot: archiveRoot(entries),
    adminManagement,
    coverage,
    pageDiscovery: discovery.pageDiscovery,
    componentDiscovery: discovery.componentDiscovery,
    featureDiscovery: discovery.featureDiscovery,
    quality: discovery.quality,
    visualFidelity,
  };
}

function slug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "imported-template";
}
function decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function getSafeVisualFidelity(analysis: Analysis): VisualFidelity {
  return analysis.visualFidelity ?? {
    score: analysis.responsive === "PRESERVE" ? 82 : 68,
    status: analysis.responsive === "PRESERVE" ? "REVIEW" : "BLOCKED",
    cssFiles: 0,
    styleSystems: [],
    colors: 0,
    fontFamilies: 0,
    mediaQueries: 0,
    animations: 0,
    globalLeakRisks: [],
    responsiveDecision: analysis.responsive,
    checks: [
      {
        label: "Legacy persisted analysis",
        status: "REVIEW",
        detail: "Re-upload the source ZIP to regenerate complete visual-fidelity evidence.",
      },
    ],
  };
}

function normalizeAnalysis(value: Analysis | null | undefined): Analysis {
  const source = (value ?? {}) as Partial<Analysis>;

  const normalized: Analysis = {
    framework: typeof source.framework === "string" ? source.framework : "Unknown",
    pages: Array.isArray(source.pages) ? source.pages : [],
    missing: Array.isArray(source.missing) ? source.missing : [],
    ai: Array.isArray(source.ai) ? source.ai : [],
    responsive:
      source.responsive === "PRESERVE" ||
      source.responsive === "REPAIR" ||
      source.responsive === "GENERATE"
        ? source.responsive
        : "REPAIR",
    hasDb: source.hasDb === true,
    entries: Array.isArray(source.entries) ? source.entries : [],
    routes: Array.isArray(source.routes) ? source.routes : [],
    sourceRoot: typeof source.sourceRoot === "string" ? source.sourceRoot : "",
    adminManagement: Array.isArray(source.adminManagement)
      ? source.adminManagement
      : [],
    coverage: Array.isArray(source.coverage) ? source.coverage : [],
    pageDiscovery: Array.isArray(source.pageDiscovery)
      ? source.pageDiscovery
      : [],
    componentDiscovery: Array.isArray(source.componentDiscovery)
      ? source.componentDiscovery
      : [],
    featureDiscovery: Array.isArray(source.featureDiscovery)
      ? source.featureDiscovery
      : [],
    quality:
      source.quality ??
      ({
        projectType: "UNKNOWN",
        completeness: 0,
        designCompleteness: 0,
        dataBinding: 0,
        interaction: 0,
        responsive: 0,
        classification: "INCOMPLETE",
        difficulty: "EASY",
      } as QualitySummary),
    visualFidelity: undefined as unknown as VisualFidelity,
  };

  normalized.visualFidelity = getSafeVisualFidelity(normalized);
  return normalized;
}

function buildValidationCertification(
  analysis: Analysis,
  completionPlan: CompletionPlan,
  targetReady: boolean,
  artifactGenerated: boolean,
): ValidationCertification {
  const visualFidelity = getSafeVisualFidelity(analysis);
  const gates: ValidationGate[] = [];
  const add = (key: string, label: string, status: ValidationGateStatus, detail: string) => {
    gates.push({ key, label, status, detail });
  };

  add(
    "archive",
    "Archive integrity",
    analysis.entries.length > 0 ? "PASS" : "BLOCKED",
    analysis.entries.length > 0
      ? `${analysis.entries.length} source entries were indexed successfully.`
      : "No readable source entry was discovered.",
  );

  add(
    "framework",
    "Framework discovery",
    analysis.framework && analysis.framework !== "Unknown" ? "PASS" : "REVIEW",
    analysis.framework && analysis.framework !== "Unknown"
      ? `${analysis.framework} was selected as the primary source framework.`
      : "The source framework needs developer confirmation.",
  );

  add(
    "pages",
    "Required page coverage",
    analysis.pageDiscovery.some((item) => item.status === "BROKEN") ? "BLOCKED"
      : analysis.pageDiscovery.some((item) => item.status !== "PRESENT") ? "REVIEW"
      : "PASS",
    `${analysis.pageDiscovery.filter((item) => item.status === "PRESENT").length}/${analysis.pageDiscovery.length} required pages are present; missing and partial pages remain in the completion plan.`,
  );

  add(
    "components",
    "Required component coverage",
    analysis.componentDiscovery.some((item) => item.status === "MISSING") ? "REVIEW" : "PASS",
    `${analysis.componentDiscovery.filter((item) => item.status === "PRESENT").length}/${analysis.componentDiscovery.length} required components are present.`,
  );

  add(
    "typescript",
    "TypeScript/code generation",
    artifactGenerated ? "PASS" : "REVIEW",
    artifactGenerated
      ? "A DRAFT code-only plugin artifact was generated. Sandbox typecheck is still required after installation."
      : "Generate the DRAFT artifact before certification.",
  );

  add(
    "routes",
    "Route integrity",
    analysis.routes.length > 0 ? "PASS" : "REVIEW",
    analysis.routes.length > 0
      ? `${analysis.routes.length} source routes were mapped.`
      : "No explicit source routes were detected; generated route ownership must be reviewed.",
  );

  const unconnectedFeatures = analysis.featureDiscovery.filter(
    (item) => item.status === "UNCONNECTED" || item.status === "MISSING",
  );
  add(
    "api",
    "Real API and data binding",
    unconnectedFeatures.length === 0 ? "PASS" : "REVIEW",
    unconnectedFeatures.length === 0
      ? "No unconnected feature signal remains in discovery."
      : `${unconnectedFeatures.length} feature(s) still require real API/runtime binding validation.`,
  );

  const manualCoverage = analysis.coverage.filter((item) =>
    [item.admin, item.api, item.permission, item.database, item.ai].includes("MANUAL"),
  );
  add(
    "permissions",
    "Permission and management coverage",
    manualCoverage.length === 0 ? "PASS" : "REVIEW",
    manualCoverage.length === 0
      ? "No manual permission/management dependency is currently flagged."
      : `${manualCoverage.length} feature dependency chain(s) require manual permission or management review.`,
  );

  add(
    "ai",
    "AI capability reconciliation",
    analysis.ai.length === 0 ? "PASS"
      : analysis.coverage.some((item) => item.ai === "MANUAL") ? "REVIEW"
      : "PASS",
    analysis.ai.length === 0
      ? "No imported AI capability was detected."
      : `${analysis.ai.length} imported AI signal(s) were preserved for platform integration review.`,
  );

  add(
    "visual",
    "CSS/theme fidelity",
    visualFidelity.status === "BLOCKED" ? "BLOCKED"
      : visualFidelity.status === "REVIEW" ? "REVIEW"
      : "PASS",
    `Visual fidelity score ${visualFidelity.score}%; responsive action ${visualFidelity.responsiveDecision}.`,
  );

  add(
    "responsive",
    "Responsive viewport readiness",
    analysis.responsive === "PRESERVE" ? "PASS" : "REVIEW",
    analysis.responsive === "PRESERVE"
      ? "Existing responsive foundation will be preserved."
      : `${analysis.responsive} is required across 320–1920px before publish.`,
  );

  add(
    "target",
    "Tenant/store/template target",
    targetReady ? "PASS" : "BLOCKED",
    targetReady
      ? "Tenant, store and template target are selected."
      : "Select a valid tenant, store and template target.",
  );

  add(
    "mapping",
    "Mapping blockers",
    completionPlan.blockers.length > 0 ? "BLOCKED"
      : completionPlan.warnings.length > 0 ? "REVIEW"
      : "PASS",
    completionPlan.blockers.length > 0
      ? `${completionPlan.blockers.length} blocker(s) must be resolved.`
      : completionPlan.warnings.length > 0
        ? `${completionPlan.warnings.length} mapping warning(s) require review.`
        : "No mapping blocker was detected.",
  );

  add(
    "database",
    "Database governance",
    analysis.hasDb || analysis.coverage.some((item) => item.database === "MANUAL") ? "REVIEW" : "PASS",
    analysis.hasDb || analysis.coverage.some((item) => item.database === "MANUAL")
      ? "Database/schema work must be delivered and executed through a separate PowerShell package."
      : "No database/schema change is requested by the current discovery.",
  );

  const blocked = gates.filter((gate) => gate.status === "BLOCKED").length;
  const review = gates.filter((gate) => gate.status === "REVIEW").length;
  const pass = gates.filter((gate) => gate.status === "PASS").length;
  const score = Math.round(((pass + review * 0.55) / Math.max(1, gates.length)) * 100);
  const publishReady = blocked === 0 && review === 0 && artifactGenerated;
  const status: ValidationCertification["status"] =
    blocked > 0 ? "BLOCKED" : publishReady ? "CERTIFIED" : "REVIEW_REQUIRED";

  const requiredActions = gates
    .filter((gate) => gate.status !== "PASS")
    .map((gate) => `${gate.label}: ${gate.detail}`);

  return { score, status, publishReady, gates, requiredActions };
}

function encode(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
function normalizeSourcePath(path: string, root: string): string {
  const withoutRoot = root && path.startsWith(root) ? path.slice(root.length) : path;
  return withoutRoot.replace(/^\.\//, "");
}
function outputExtension(path: string): string {
  if (path.endsWith(".jsx")) return `${path.slice(0, -4)}.tsx`;
  if (path.endsWith(".js") && /(^|\/)src\//.test(path)) return `${path.slice(0, -3)}.ts`;
  return path;
}
function relativeImport(fromFile: string, target: string): string {
  const fromParts = fromFile.split("/").slice(0, -1);
  const targetParts = target.split("/");
  while (fromParts.length && targetParts.length && fromParts[0] === targetParts[0]) {
    fromParts.shift();
    targetParts.shift();
  }
  const prefix = fromParts.map(() => "..").join("/");
  return `${prefix ? `${prefix}/` : "./"}${targetParts.join("/")}`.replace(/\.(jsx?|tsx?)$/, "");
}
function rewriteAliasImports(path: string, source: string): string {
  return source.replace(/from\s+(["'])(components|pages|utils)\/([^"']+)\1/g, (_full, quote, root, rest) => {
    const target = `src/${root}/${rest}`;
    return `from ${quote}${relativeImport(path, target)}${quote}`;
  });
}
function convertText(path: string, source: string): string {
  let output = rewriteAliasImports(path, source);
  output = output.replace(/import\.meta\.env\.VITE_([A-Z0-9_]+)/g, "process.env.NEXT_PUBLIC_$1");
  output = output.replace(/\bclass=/g, "className=");
  output = output.replace(/import\s+React\s+from\s+["']react["'];?\s*/g, "");
  output = output.replace(/import\s+\{\s*BrowserRouter[^;]+from\s+["']react-router-dom["'];?/g, "");
  output = output.replace(/import\s+\{\s*useNavigate\s*\}\s+from\s+["']react-router-dom["'];?/g, 'import { useRouter } from "next/navigation";');
  output = output.replace(/const\s+navigate\s*=\s*useNavigate\(\);/g, "const router = useRouter();");
  output = output.replace(/navigate\(([^)]+)\)/g, "router.push($1)");
  output = output.replace(/import\s+\{\s*useLocation\s*\}\s+from\s+["']react-router-dom["'];?/g, 'import { usePathname } from "next/navigation";');
  output = output.replace(/const\s+location\s*=\s*useLocation\(\);/g, "const pathname = usePathname();");
  output = output.replace(/location\.pathname/g, "pathname");
  if (/\b(useState|useEffect|useMemo|useCallback|useRef|useRouter|usePathname)\b/.test(output) && !/^\s*["']use client["'];/m.test(output)) {
    output = `"use client";\n\n${output}`;
  }
  if (path.endsWith(".blade.php")) {
    return `/* Converted from Laravel Blade. Dynamic Blade directives require manual review. */\nexport default function MigratedBladeView(){return <div className="migrated-blade-view"><pre>{${JSON.stringify(source.slice(0, 12_000))}}</pre></div>}\n`;
  }
  return output;
}

function crcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let k = 0; k < 8; k += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[n] = value >>> 0;
  }
  return table;
}
const CRC = crcTable();
function crc32(data: Uint8Array): number {
  let value = 0xffffffff;
  for (const byte of data) value = CRC[(value ^ byte) & 255] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}
function dosDateTime() {
  const date = new Date();
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function normalizeArchivePath(path: string): string {
  return path
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

function archivePathKey(path: string): string {
  return normalizeArchivePath(path).toLocaleLowerCase("en-US");
}

function uniqueArchiveFiles(files: GeneratedFile[]): GeneratedFile[] {
  const seen = new Set<string>();
  const result: GeneratedFile[] = [];

  for (const file of files) {
    const normalizedPath = normalizeArchivePath(file.path);
    const key = archivePathKey(normalizedPath);
    if (!normalizedPath || seen.has(key)) continue;
    seen.add(key);
    result.push({ ...file, path: normalizedPath });
  }

  return result;
}

function uniqueFileDefinitions(
  definitions: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const seenDestinations = new Set<string>();
  const seenSources = new Set<string>();
  const result: Array<Record<string, unknown>> = [];

  for (const definition of definitions) {
    const owner = String(definition.owner ?? "").trim().toLocaleLowerCase("en-US");
    const destinationPath = normalizeArchivePath(String(definition.destinationPath ?? ""));
    const sourcePath = normalizeArchivePath(String(definition.sourcePath ?? ""));
    const destinationKey = `${owner}:${archivePathKey(destinationPath)}`;
    const sourceKey = archivePathKey(sourcePath);

    if (!owner || !destinationPath || !sourcePath) continue;
    if (seenDestinations.has(destinationKey) || seenSources.has(sourceKey)) continue;

    seenDestinations.add(destinationKey);
    seenSources.add(sourceKey);
    result.push({
      ...definition,
      sourcePath,
      destinationPath,
    });
  }

  return result;
}


function zipStore(files: GeneratedFile[]): Blob {
  files = uniqueArchiveFiles(files);
  const local: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const encoder = new TextEncoder();
  const dateTime = dosDateTime();

  for (const file of files) {
    const name = encoder.encode(file.path);
    const data = file.content;
    const crc = crc32(data);
    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dateTime.time, true);
    localView.setUint16(12, dateTime.date, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, name.length, true);
    localHeader.set(name, 30);
    local.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(12, dateTime.time, true);
    centralView.setUint16(14, dateTime.date, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(name, 46);
    central.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralSize = central.reduce((total, item) => total + item.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  const zipParts: BlobPart[] = [...local, ...central, end].map((chunk) => {
    const owned = new Uint8Array(chunk.byteLength);
    owned.set(chunk);
    return owned.buffer;
  });
  return new Blob(zipParts, { type: "application/zip" });
}

async function sha(data: Uint8Array): Promise<string> {
  const owned = new Uint8Array(data.byteLength);
  owned.set(data);
  const hash = await crypto.subtle.digest("SHA-256", owned.buffer);
  return Array.from(new Uint8Array(hash))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}
function save(blob: Blob, name: string) {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 5000);
}
function routeFolder(route: string): string {
  if (route === "/" || route === "/homepage") return "preview";
  return route.replace(/^\//, "").replace(/:\w+/g, "[slug]").replace(/\*/g, "not-found") || "preview";
}
function generatedRoutePage(templateKey: string, route: RouteInfo): string {
  const source = route.sourceImport?.replace(/^\.\//, "") || "pages/homepage";
  const importPath = `../../../../templates/imported/${templateKey}/source/src/${source}`;
  return `import MigratedPage from ${JSON.stringify(importPath)};\n\nexport default function Page(){return <MigratedPage/>;}\n`;
}
function platformApiAdapter(): string {
  return `const API=(process.env.NEXT_PUBLIC_API_URL||"http://localhost:5000/api").replace(/\\/$/,"");\n\nasync function request<T>(path:string):Promise<T>{const response=await fetch(API+path,{credentials:"include",cache:"no-store"});if(!response.ok)throw new Error("API request failed: "+response.status);const payload=await response.json();return (payload?.data??payload) as T;}\n\nexport const platformApi={products:()=>request<unknown[]>("/products"),categories:()=>request<unknown[]>("/categories"),lookbooks:()=>request<unknown[]>("/lookbooks"),account:()=>request<unknown>("/account/profile"),orders:()=>request<unknown[]>("/orders")};\n`;
}
function generatedMissingPage(name: string): string {
  const existingRoutes: Record<string, string> = {
    login: "/login",
    register: "/register",
    wishlist: "/wishlist",
    account: "/account",
    orders: "/orders",
    lookbook: "/lookbook",
    cart: "/cart",
    checkout: "/checkout",
    search: "/shop",
    category: "/shop",
    "product-list": "/shop",
    "product-detail": "/shop",
    "404": "/not-found",
  };
  const route = existingRoutes[name] || "/";
  return `import {redirect} from "next/navigation";\nexport default function ReusedPlatformPage(){redirect(${JSON.stringify(route)});}\n`;
}

function generatedAdminManagementPage(capability: AdminCapability, templateKey: string): string {
  const fields = JSON.stringify(capability.fields);
  const title = JSON.stringify(capability.label);
  return `"use client";

import { useState } from "react";

const FIELDS = ${fields} as const;

export default function MigratedManagementPage(){
  const [form,setForm]=useState<Record<string,string>>({});
  return <main style={{padding:24}}><h1>{${title}}</h1><p>Generated for migrated template: ${templateKey}. Tenant/store scope and permission validation are required before publish.</p><form style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,maxWidth:1100}}>{FIELDS.map((field)=><label key={field} style={{display:"grid",gap:6}}><span>{field}</span><input value={form[field]||""} onChange={(event)=>setForm((current)=>({...current,[field]:event.target.value}))} style={{padding:10,border:"1px solid #334155",borderRadius:8}} /></label>)}</form><p style={{marginTop:18}}>Save is intentionally disabled until the generated server API and any required database PowerShell package pass validation.</p></main>;
}
`;
}

function generatedServerContract(capability: AdminCapability, templateKey: string): string {
  const fields = JSON.stringify(capability.fields);
  return `import { Router } from "express";

export const ${capability.key.replace(/[^a-zA-Z0-9]/g, "_")}MigratedRouter = Router();
const REQUIRED_FIELDS = ${fields} as const;

${capability.key.replace(/[^a-zA-Z0-9]/g, "_")}MigratedRouter.get("/", async (_req, res) => {
  res.status(501).json({ success: false, code: "MIGRATED_FEATURE_NOT_BOUND", message: "Bind this generated contract to the existing service or approved database implementation before publish.", templateKey: ${JSON.stringify(templateKey)} });
});

${capability.key.replace(/[^a-zA-Z0-9]/g, "_")}MigratedRouter.post("/", async (req, res) => {
  const missing = REQUIRED_FIELDS.filter((field) => req.body?.[field] === undefined);
  if (missing.length) return res.status(400).json({ success: false, message: "Required fields missing", missing });
  return res.status(501).json({ success: false, code: "MIGRATED_FEATURE_NOT_BOUND", message: "Generated source contract requires service/database binding before activation." });
});
`;
}

function generatedPermissionKey(templateKey: string, capability: AdminCapability): string {
  return `migrated.${templateKey}.${capability.key}.manage`;
}


const MIGRATOR_SESSION_KEY = "saqso.ai-migrator.session.v2026.9";
const MIGRATOR_DB_NAME = "saqso-ai-migrator";
const MIGRATOR_STORE_NAME = "archives";

type PersistedSession = {
  fileName: string;
  fileType: string;
  fileLastModified: number;
  analysis: Analysis;
  sourceEntries: Array<[string, string]>;
  tenant: string;
  store: string;
  template: string;
  newKey: string;
  mode: string;
  options: {
    convert: boolean;
    reuseApi: boolean;
    realData: boolean;
    missing: boolean;
    theme: boolean;
    ai: boolean;
    responsive: boolean;
  };
  progress: number;
  log: string[];
};

function openMigratorDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MIGRATOR_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MIGRATOR_STORE_NAME)) {
        db.createObjectStore(MIGRATOR_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open AI Migrator storage"));
  });
}

async function saveArchiveBuffer(buffer: ArrayBuffer): Promise<void> {
  const db = await openMigratorDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(MIGRATOR_STORE_NAME, "readwrite");
    transaction.objectStore(MIGRATOR_STORE_NAME).put(buffer, "active-archive");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Unable to save uploaded archive"));
  });
  db.close();
}

async function loadArchiveBuffer(): Promise<ArrayBuffer | null> {
  const db = await openMigratorDb();
  const result = await new Promise<ArrayBuffer | null>((resolve, reject) => {
    const transaction = db.transaction(MIGRATOR_STORE_NAME, "readonly");
    const request = transaction.objectStore(MIGRATOR_STORE_NAME).get("active-archive");
    request.onsuccess = () => resolve(request.result instanceof ArrayBuffer ? request.result : null);
    request.onerror = () => reject(request.error ?? new Error("Unable to restore uploaded archive"));
  });
  db.close();
  return result;
}

async function clearPersistedMigration(): Promise<void> {
  sessionStorage.removeItem(MIGRATOR_SESSION_KEY);
  const db = await openMigratorDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(MIGRATOR_STORE_NAME, "readwrite");
    transaction.objectStore(MIGRATOR_STORE_NAME).delete("active-archive");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Unable to clear uploaded archive"));
  });
  db.close();
}


type CompletionArtifact = {
  path: string;
  content: Uint8Array;
  category: "PAGE" | "COMPONENT" | "ADAPTER" | "CERTIFICATION";
};

function completionComponentName(key: string): string {
  return key
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function generateCompletionArtifacts(
  templateKey: string,
  analysisInput: Analysis,
): CompletionArtifact[] {
  const analysis = normalizeAnalysis(analysisInput);
  const base = `src/templates/imported/${templateKey}/completion`;
  const artifacts: CompletionArtifact[] = [];

  const completionPages = analysis.pageDiscovery.filter(
    (page) => page.status === "MISSING" || page.status === "BROKEN",
  );

  for (const page of completionPages) {
    const name = completionComponentName(page.key || page.label);
    const content = `"use client";

import React from "react";

export default function ${name}CompletionPage() {
  return (
    <main data-completion-page="${page.key}" data-status="REVIEW_REQUIRED">
      <section>
        <h1>${page.label}</h1>
        <p>
          Generated by SAQSO AI Migrator 2026.24 LTS because the imported page
          was ${page.status.toLowerCase()}. Preserve the imported theme and connect
          the current platform data contract before publish.
        </p>
      </section>
    </main>
  );
}
`;
    artifacts.push({
      path: `${base}/pages/${page.key}.tsx`,
      content: encode(content),
      category: "PAGE",
    });
  }

  const completionComponents = analysis.componentDiscovery.filter(
    (component) =>
      component.status === "MISSING" || component.status === "PARTIAL",
  );

  for (const component of completionComponents) {
    const name = completionComponentName(component.key || component.label);
    const content = `"use client";

import React from "react";

export type ${name}Props = {
  className?: string;
  children?: React.ReactNode;
};

export default function ${name}({ className, children }: ${name}Props) {
  return (
    <section
      className={className}
      data-completion-component="${component.key}"
      data-status="REVIEW_REQUIRED"
    >
      {children}
    </section>
  );
}
`;
    artifacts.push({
      path: `${base}/components/${component.key}.tsx`,
      content: encode(content),
      category: "COMPONENT",
    });
  }

  const unconnectedFeatures = analysis.featureDiscovery.filter(
    (feature) => feature.status === "UNCONNECTED",
  );

  for (const feature of unconnectedFeatures) {
    const name = completionComponentName(feature.key);
    const content = `const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:5000/api"
).replace(/\\/$/, "");

export async function fetch${name}Data<T>(
  path = "/${feature.key}",
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(\`\${API_BASE}\${path}\`, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || "${feature.label} API request failed");
  }

  return (body?.data ?? body) as T;
}
`;
    artifacts.push({
      path: `${base}/adapters/${feature.key}.ts`,
      content: encode(content),
      category: "ADAPTER",
    });
  }

  const certification = {
    generatedAt: new Date().toISOString(),
    templateKey,
    sourceCompleteness: analysis.quality.completeness,
    generatedPages: completionPages.map((item) => item.key),
    generatedComponents: completionComponents.map((item) => item.key),
    generatedAdapters: unconnectedFeatures.map((item) => item.key),
    status:
      completionPages.length === 0 &&
      completionComponents.length === 0 &&
      unconnectedFeatures.length === 0
        ? "PASS"
        : "REVIEW_REQUIRED",
    publishReady: false,
    requiredValidation: [
      "Integrate generated pages with imported theme and current routes.",
      "Validate generated API adapter endpoints against current server contracts.",
      "Validate tenant/store isolation.",
      "Validate responsive behavior at 320, 375, 390, 414, 768, 1024, 1280, 1440 and 1920.",
      "Run client build and runtime smoke tests before activation.",
    ],
  };

  artifacts.push({
    path: `${base}/completion-certification.json`,
    content: encode(JSON.stringify(certification, null, 2)),
    category: "CERTIFICATION",
  });

  return artifacts;
}


type SemanticDesignArtifact = {
  path: string;
  content: Uint8Array;
  category:
    | "DESIGN_TOKENS"
    | "PAGE_CONTRACT"
    | "FILTER_TAXONOMY"
    | "ADMIN_GAP"
    | "FIDELITY_CERTIFICATION";
};

const SEMANTIC_FILTER_CATALOG = [
  {
    key: "color",
    label: "Color",
    signals: ["color", "swatch", "hex", "rgb", "colour"],
    adminEntity: "ProductColor",
    fields: ["name", "slug", "hex", "image", "sortOrder", "status"],
  },
  {
    key: "occasion",
    label: "Occasion",
    signals: ["occasion", "wedding", "office", "party", "casual", "festival"],
    adminEntity: "ProductOccasion",
    fields: ["name", "slug", "description", "image", "sortOrder", "status"],
  },
  {
    key: "style-personality",
    label: "Style Personality",
    signals: ["style personality", "minimal", "luxury", "streetwear", "classic", "vintage"],
    adminEntity: "StylePersonality",
    fields: ["name", "slug", "description", "icon", "sortOrder", "status"],
  },
  {
    key: "sustainability",
    label: "Sustainability",
    signals: ["sustainability", "organic", "recycled", "ethical", "vegan", "fair trade"],
    adminEntity: "SustainabilityAttribute",
    fields: ["name", "slug", "description", "badgeColor", "icon", "sortOrder", "status"],
  },
  {
    key: "size",
    label: "Size",
    signals: ["size", "xs", "xxl", "variant size"],
    adminEntity: "ProductSize",
    fields: ["name", "code", "sortOrder", "status"],
  },
  {
    key: "price-range",
    label: "Price Range",
    signals: ["price range", "minimum price", "maximum price"],
    adminEntity: null,
    fields: [],
  },
] as const;

function semanticText(analysis: Analysis): string {
  return JSON.stringify(analysis).toLowerCase();
}

function generateSemanticDesignArtifacts(
  templateKey: string,
  analysisInput: Analysis,
): SemanticDesignArtifact[] {
  const analysis = normalizeAnalysis(analysisInput);
  const base = `src/templates/imported/${templateKey}/semantic`;
  const artifacts: SemanticDesignArtifact[] = [];
  const sourceText = semanticText(analysis);

  const detectedFilters = SEMANTIC_FILTER_CATALOG.filter((filter) =>
    filter.signals.some((signal) => sourceText.includes(signal)),
  );

  const designTokens = {
    generatedAt: new Date().toISOString(),
    templateKey,
    scope: "ALL_DISCOVERED_PAGES",
    preserve: {
      typography: true,
      spacing: true,
      radius: true,
      borders: true,
      shadows: true,
      icons: true,
      widgetColors: true,
      interactionStates: true,
      animations: true,
      responsiveBreakpoints: true,
    },
    requiredExtraction: [
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "foreground/background colors",
      "border colors and widths",
      "radius",
      "shadow",
      "grid columns",
      "gap and padding",
      "icon size/stroke/fill/color",
      "hover/focus/active/disabled state",
      "transition duration/easing",
      "desktop/tablet/mobile breakpoint behavior",
    ],
    fidelityPolicy: {
      target: 100,
      tolerance: 0,
      status: "REVIEW_REQUIRED",
      rule:
        "Do not mark publish-ready until source and migrated screenshots pass page-level visual comparison.",
    },
  };

  artifacts.push({
    path: `${base}/design-token-contract.json`,
    content: encode(JSON.stringify(designTokens, null, 2)),
    category: "DESIGN_TOKENS",
  });

  for (const page of analysis.pageDiscovery) {
    const contract = {
      generatedAt: new Date().toISOString(),
      templateKey,
      pageKey: page.key,
      label: page.label,
      discoveryStatus: page.status,
      sourceScore: page.score,
      evidence: page.evidence,
      gaps: page.gaps,
      preserve: [
        "layout hierarchy",
        "component order",
        "typography",
        "colors",
        "icons",
        "widget states",
        "spacing",
        "responsive behavior",
      ],
      validation: {
        screenshotComparisonRequired: true,
        viewports: [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920],
        targetSimilarity: 100,
        status: "REVIEW_REQUIRED",
      },
    };

    artifacts.push({
      path: `${base}/pages/${page.key}.design-contract.json`,
      content: encode(JSON.stringify(contract, null, 2)),
      category: "PAGE_CONTRACT",
    });
  }

  const filterTaxonomy = {
    generatedAt: new Date().toISOString(),
    templateKey,
    detected: detectedFilters,
    uiRequirements: {
      preserveAccordionOrder: true,
      preserveSwatchShape: true,
      preserveSwatchBorder: true,
      preserveSelectedState: true,
      preserveCounts: true,
      preserveIconColor: true,
      preserveWidgetSpacing: true,
      preserveMobileDrawerBehavior: true,
    },
  };

  artifacts.push({
    path: `${base}/catalog-filter-taxonomy.json`,
    content: encode(JSON.stringify(filterTaxonomy, null, 2)),
    category: "FILTER_TAXONOMY",
  });

  const adminGapPlan = detectedFilters
    .filter((filter) => filter.adminEntity)
    .map((filter) => ({
      capabilityKey: filter.key,
      label: filter.label,
      entity: filter.adminEntity,
      fields: filter.fields,
      requiredLayers: [
        "database compatibility audit",
        "server API contract",
        "tenant/store scope",
        "permission",
        "Admin list/create/edit",
        "product assignment",
        "storefront filter adapter",
        "import/export",
      ],
      databaseAction: "AUDIT_REQUIRED",
      databaseDelivery:
        "Generate a separate approved PowerShell package only when the existing schema cannot represent this capability.",
      pluginDelivery:
        "Generate code-only Admin/API/client integration through Plugin Installer.",
      status: "REVIEW_REQUIRED",
    }));

  artifacts.push({
    path: `${base}/admin-capability-gap-plan.json`,
    content: encode(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          templateKey,
          capabilities: adminGapPlan,
          duplicatePolicy: "REUSE_EXISTING_CAPABILITY_BEFORE_GENERATE",
        },
        null,
        2,
      ),
    ),
    category: "ADMIN_GAP",
  });

  const certification = {
    generatedAt: new Date().toISOString(),
    templateKey,
    pageCount: analysis.pageDiscovery.length,
    detectedSemanticFilters: detectedFilters.map((item) => item.key),
    adminCapabilitiesRequiringAudit: adminGapPlan.map((item) => item.capabilityKey),
    requiredChecks: [
      "All source pages have a design contract.",
      "Color swatches retain exact shape, border, spacing, selected and disabled states.",
      "Occasion, Style Personality and Sustainability preserve source order and accordion behavior.",
      "Widget/icon size, stroke, fill and color match source.",
      "No hardcoded demo business data remains.",
      "All filters use current real APIs and tenant/store isolation.",
      "Missing Admin capabilities have CRUD, permission and assignment support.",
      "Responsive visual comparison passes at the required viewport matrix.",
    ],
    visualFidelityTarget: 100,
    visualFidelityStatus: "REVIEW_REQUIRED",
    adminCompletenessStatus:
      adminGapPlan.length === 0 ? "PASS" : "REVIEW_REQUIRED",
    publishReady: false,
  };

  artifacts.push({
    path: `${base}/semantic-fidelity-certification.json`,
    content: encode(JSON.stringify(certification, null, 2)),
    category: "FIDELITY_CERTIFICATION",
  });

  return artifacts;
}

export default function MigrationStudioFoundation() {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [sourceMap, setSourceMap] = useState<Map<string, string>>(new Map());
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [state, setState] = useState<RunState>("IDLE");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [tenants, setTenants] = useState<SelectItem[]>([]);
  const [stores, setStores] = useState<SelectItem[]>([]);
  const [templates, setTemplates] = useState<SelectItem[]>([]);
  const [tenant, setTenant] = useState("");
  const [store, setStore] = useState("");
  const [template, setTemplate] = useState("");
  const [newKey, setNewKey] = useState("");
  const [mode, setMode] = useState("TEMPLATE_VARIANT");
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [targetError, setTargetError] = useState("");
  const [pluginBlob, setPluginBlob] = useState<Blob | null>(null);
  const [reportBlob, setReportBlob] = useState<Blob | null>(null);
  const [psBlob, setPsBlob] = useState<Blob | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<DraftCodeFile[]>([]);
  const [codeApproved, setCodeApproved] = useState(false);
  const [executionApproved, setExecutionApproved] = useState(false);
  const [options, setOptions] = useState({
    convert: true,
    reuseApi: true,
    realData: true,
    missing: true,
    theme: true,
    ai: true,
    responsive: true,
  });
  const [restoring, setRestoring] = useState(true);
  const filteredStores = useMemo(
    () => stores.filter((item) => item.tenantId === tenant),
    [stores, tenant],
  );

  async function refreshTargetCatalog() {
    setLoadingTargets(true);
    setTargetError("");

    try {
      const response = await fetch(`${API}/platform-tenancy/catalog`, {
        headers: authHeaders(),
        credentials: "include",
        cache: "no-store",
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || json?.success === false) {
        throw new Error(json?.message || `Target catalog request failed (${response.status})`);
      }

      const catalog = json?.data ?? json ?? {};
      const tenantRows = Array.isArray(catalog?.tenants) ? catalog.tenants : [];
      const templateRows = Array.isArray(catalog?.templates) ? catalog.templates : [];

      const tenantItems: SelectItem[] = tenantRows
        .map((tenantRecord: any) => ({
          id: String(tenantRecord?.id ?? "").trim(),
          name: String(tenantRecord?.name ?? tenantRecord?.slug ?? tenantRecord?.id ?? "").trim(),
          slug: tenantRecord?.slug ? String(tenantRecord.slug) : undefined,
        }))
        .filter((item: SelectItem) => item.id && item.name)
        .sort((a: SelectItem, b: SelectItem) => a.name.localeCompare(b.name));

      const storeItems: SelectItem[] = tenantRows
        .flatMap((tenantRecord: any) => {
          const tenantId = String(tenantRecord?.id ?? "").trim();
          const tenantStores = Array.isArray(tenantRecord?.stores) ? tenantRecord.stores : [];

          return tenantStores.map((storeRecord: any) => ({
            id: String(storeRecord?.id ?? "").trim(),
            name: String(storeRecord?.name ?? storeRecord?.id ?? "").trim(),
            tenantId,
          }));
        })
        .filter((item: SelectItem) => item.id && item.name && item.tenantId)
        .sort((a: SelectItem, b: SelectItem) => a.name.localeCompare(b.name));

      const templateItems: SelectItem[] = templateRows
        .map((templateRecord: any) => ({
          id: String(templateRecord?.id ?? "").trim(),
          name: String(templateRecord?.name ?? templateRecord?.slug ?? templateRecord?.id ?? "").trim(),
          slug: templateRecord?.slug ? String(templateRecord.slug) : undefined,
        }))
        .filter((item: SelectItem) => item.id && item.name)
        .sort((a: SelectItem, b: SelectItem) => a.name.localeCompare(b.name));

      setTenants(tenantItems);
      setStores(storeItems);
      setTemplates(templateItems);

      setTenant((current) => tenantItems.some((item) => item.id === current) ? current : "");
      setStore((current) => storeItems.some((item) => item.id === current) ? current : "");
      setTemplate((current) => templateItems.some((item) => item.id === current) ? current : "");

      if (tenantItems.length === 0) {
        setTargetError("No tenants are available. Create a tenant from Tenant Management, then refresh.");
      } else if (templateItems.length === 0) {
        setTargetError("No templates are registered yet. Create a template in Tenant Management or generate a new template from the uploaded project.");
      }
    } catch (reason) {
      setTargetError(`Target catalog: ${reason instanceof Error ? reason.message : String(reason)}`);
    } finally {
      setLoadingTargets(false);
    }
  }

  useEffect(() => {
    refreshTargetCatalog();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function restoreSession() {
      try {
        const raw = sessionStorage.getItem(MIGRATOR_SESSION_KEY);
        if (!raw) return;
        const persisted = JSON.parse(raw) as PersistedSession;
        const archiveBuffer = await loadArchiveBuffer();
        if (!archiveBuffer || cancelled) return;
        const restoredFile = new File([archiveBuffer], persisted.fileName, { type: persisted.fileType || "application/zip", lastModified: persisted.fileLastModified });
        setFile(restoredFile);
        setBuffer(archiveBuffer);
        setAnalysis(normalizeAnalysis(persisted.analysis));
        setSourceMap(new Map(persisted.sourceEntries));
        setTenant(persisted.tenant);
        setStore(persisted.store);
        setTemplate(persisted.template);
        setNewKey(persisted.newKey);
        setMode(persisted.mode);
        setOptions(persisted.options);
        setProgress(persisted.progress);
        setLog([...persisted.log, "Migration workspace restored after refresh"]);
        setState("ANALYZED");
      } catch (reason) {
        console.warn("AI Migrator session restore failed", reason);
      } finally {
        if (!cancelled) setRestoring(false);
      }
    }
    restoreSession();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (restoring || !file || !analysis) return;
    const persisted: PersistedSession = {
      fileName: file.name,
      fileType: file.type,
      fileLastModified: file.lastModified,
      analysis,
      sourceEntries: Array.from(sourceMap.entries()),
      tenant,
      store,
      template,
      newKey,
      mode,
      options,
      progress,
      log,
    };
    sessionStorage.setItem(MIGRATOR_SESSION_KEY, JSON.stringify(persisted));
  }, [restoring, file, analysis, sourceMap, tenant, store, template, newKey, mode, options, progress, log]);

  useEffect(() => {
    setStore("");
    setTemplate("");
  }, [tenant]);

  const tenantStores = useMemo(
    () =>
      stores.filter(
        (item) => !tenant || !item.tenantId || item.tenantId === tenant,
      ),
    [stores, tenant],
  );

  const targetKey = slug(mode === "UPDATE_EXISTING" ? template : newKey);
  const ready = useMemo(
    () => Boolean(file && buffer && analysis && tenant && store && targetKey),
    [file, buffer, analysis, tenant, store, targetKey],
  );
  const completionPlan = useMemo(
    () => (analysis ? buildCompletionPlan(analysis) : null),
    [analysis],
  );
  const visualFidelity = useMemo(
    () => (analysis ? getSafeVisualFidelity(analysis) : null),
    [analysis],
  );
  const validationCertification = useMemo(
    () =>
      analysis && completionPlan
        ? buildValidationCertification(
            analysis,
            completionPlan,
            ready,
            state === "DONE" && Boolean(pluginBlob),
          )
        : null,
    [analysis, completionPlan, ready, state, pluginBlob],
  );

  function downloadCompletionPlan() {
    if (!completionPlan || !analysis || !file) return;
    const content = JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: file.name,
        framework: analysis.framework,
        quality: analysis.quality,
        plan: completionPlan,
        validation: validationCertification,
      },
      null,
      2,
    );
    save(new Blob([content], { type: "application/json" }), "smart-mapping-completion-plan.json");
  }

  async function choose(selected: File) {
    try {
      setError("");
      setLog([]);
      setProgress(0);
      setPluginBlob(null);
      setReportBlob(null);
      setPsBlob(null);
      setGeneratedFiles([]);
      setCodeApproved(false);
      setExecutionApproved(false);
      const archiveBuffer = await selected.arrayBuffer();
      await saveArchiveBuffer(archiveBuffer);
      const entries = parseZip(archiveBuffer);
      const textFiles = new Map<string, string>();
      for (const entry of entries) {
        if (!TEXT_EXT.test(entry.name) || entry.uncompressedSize > 2_000_000) continue;
        textFiles.set(entry.name, decode(await extract(archiveBuffer, entry)));
      }
      const result = detect(entries, textFiles);
      setFile(selected);
      setBuffer(archiveBuffer);
      setSourceMap(textFiles);
      setAnalysis(normalizeAnalysis(result));
      setState("ANALYZED");
      setLog([
        `${result.framework} detected`,
        `${result.routes.length} routes discovered`,
        `${result.pages.length} required page capabilities found`,
        `${result.missing.length} missing page capabilities mapped to current platform`,
        `Responsive action: ${result.responsive}`,
        `${result.adminManagement.length} admin management capabilities detected`,
        `${result.coverage.length} feature dependency chains evaluated`,
        `${result.pageDiscovery.filter((item) => item.status === "MISSING").length} required pages missing`,
        `${result.pageDiscovery.filter((item) => item.status === "PARTIAL" || item.status === "BROKEN").length} incomplete pages detected`,
        `Project completeness: ${result.quality.completeness}% (${result.quality.classification})`,
      ]);
      setProgress(10);
      if (!newKey) setNewKey(`${slug(selected.name.replace(/\.zip$/i, ""))}-v1`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setState("FAILED");
    }
  }

  async function execute() {
    if (!ready || !file || !buffer || !analysis) return;
    try {
      setState("RUNNING");
      setError("");
      setProgress(15);
      setLog((items) => [...items, "One-click enterprise migration started", "Secure extraction started"]);

      const payload: GeneratedFile[] = [];
      const fileDefinitions: Array<Record<string, unknown>> = [];
      const sourceBase = `src/templates/imported/${targetKey}/source`;
      const convertedNames = new Set<string>();

      for (const entry of analysis.entries) {
        if (!SOURCE_EXT.test(entry.name)) continue;
        const normalized = normalizeSourcePath(entry.name, analysis.sourceRoot);
        if (!normalized || normalized.startsWith("node_modules/") || normalized.startsWith(".git/")) continue;
        let outputName = outputExtension(normalized);
        if (/^(package-lock\.json|package\.json|vite\.config|postcss\.config|tailwind\.config|index\.html)/.test(outputName)) {
          outputName = `reference/${outputName}`;
        }
        let content = await extract(buffer, entry);
        if (TEXT_EXT.test(entry.name) && options.convert) content = encode(convertText(normalized, decode(content)));
        const destinationPath = `${sourceBase}/${outputName}`;
        const destinationKey = archivePathKey(destinationPath);
        if (convertedNames.has(destinationKey)) continue;
        convertedNames.add(destinationKey);
        const sourcePath = normalizeArchivePath(`payload/client/${destinationPath}`);
        payload.push({ path: sourcePath, content });
        fileDefinitions.push({
          owner: "client",
          sourcePath,
          destinationPath,
          sha256: await sha(content),
          sizeBytes: content.length,
          contentType: TEXT_EXT.test(entry.name) ? "text/typescript" : "application/octet-stream",
          operation: "create",
        });
      }
      setProgress(45);
      setLog((items) => [...items, `${payload.length} source and asset files converted`]);

      if (options.reuseApi) {
        const content = encode(platformApiAdapter());
        const destinationPath = `src/templates/imported/${targetKey}/platformApi.ts`;
        const sourcePath = normalizeArchivePath(`payload/client/${destinationPath}`);
        payload.push({ path: sourcePath, content });
        fileDefinitions.push({ owner: "client", sourcePath, destinationPath, sha256: await sha(content), sizeBytes: content.length, contentType: "text/typescript", operation: "create" });
      }

      for (const route of analysis.routes) {
        if (route.path === "*") continue;
        const destinationPath = `src/app/migrated/${targetKey}/${routeFolder(route.path)}/page.tsx`;
        const sourcePath = normalizeArchivePath(`payload/client/${destinationPath}`);
        const content = encode(generatedRoutePage(targetKey, route));
        payload.push({ path: sourcePath, content });
        fileDefinitions.push({ owner: "client", sourcePath, destinationPath, sha256: await sha(content), sizeBytes: content.length, contentType: "text/typescript", operation: "create" });
      }

      if (options.missing) {
        for (const missingPage of analysis.missing) {
          const destinationPath = `src/app/migrated/${targetKey}/complete/${missingPage}/page.tsx`;
          const sourcePath = normalizeArchivePath(`payload/client/${destinationPath}`);
          const content = encode(generatedMissingPage(missingPage));
          payload.push({ path: sourcePath, content });
          fileDefinitions.push({ owner: "client", sourcePath, destinationPath, sha256: await sha(content), sizeBytes: content.length, contentType: "text/typescript", operation: "create" });
        }
      }

      const generatedAdminMenus: Array<Record<string, unknown>> = [];
      for (const capability of analysis.adminManagement) {
        if (capability.status === "REUSE" && capability.existingRoute) {
          setLog((items) => [...items, `${capability.label}: existing management reused (${capability.existingRoute})`]);
          continue;
        }
        const destinationPath = `src/app/migrated-management/${targetKey}/${capability.key}/page.tsx`;
        const sourcePath = normalizeArchivePath(`payload/admin/${destinationPath}`);
        const content = encode(generatedAdminManagementPage(capability, targetKey));
        payload.push({ path: sourcePath, content });
        fileDefinitions.push({ owner: "admin", sourcePath, destinationPath, sha256: await sha(content), sizeBytes: content.length, contentType: "text/typescript", operation: "create" });
        const serverDestinationPath = `src/modules/migrated/${targetKey}/${capability.key}/${capability.key}.routes.ts`;
        const serverSourcePath = normalizeArchivePath(`payload/server/${serverDestinationPath}`);
        const serverContent = encode(generatedServerContract(capability, targetKey));
        payload.push({ path: serverSourcePath, content: serverContent });
        fileDefinitions.push({ owner: "server", sourcePath: serverSourcePath, destinationPath: serverDestinationPath, sha256: await sha(serverContent), sizeBytes: serverContent.length, contentType: "text/typescript", operation: "create" });

        generatedAdminMenus.push({
          key: `saqso.migrated.${targetKey}.${capability.key}`,
          label: capability.label,
          name: capability.label,
          href: `/migrated-management/${targetKey}/${capability.key}`,
          route: `/migrated-management/${targetKey}/${capability.key}`,
          icon: "Settings2",
          section: "Website CMS",
          group: "Website CMS",
          order: 900,
          roles: ["ADMIN", "MANAGER"],
          enabled: true,
        });
      }

      const normalizedDefinitions = uniqueFileDefinitions(fileDefinitions);
      const allowedPayloadPaths = new Set(
        normalizedDefinitions.map((definition) =>
          archivePathKey(String(definition.sourcePath ?? "")),
        ),
      );
      const normalizedPayload = uniqueArchiveFiles(payload).filter((file) =>
        allowedPayloadPaths.has(archivePathKey(file.path)),
      );

      fileDefinitions.length = 0;
      fileDefinitions.push(...normalizedDefinitions);
      payload.length = 0;
      payload.push(...normalizedPayload);

      const duplicateDestinationGuard = new Set<string>();
      for (const definition of fileDefinitions) {
        const destinationKey =
          `${String(definition.owner ?? "").toLocaleLowerCase("en-US")}:` +
          archivePathKey(String(definition.destinationPath ?? ""));
        if (duplicateDestinationGuard.has(destinationKey)) {
          throw new Error(
            `Generated package contains duplicate destination: ${String(definition.destinationPath ?? "")}`,
          );
        }
        duplicateDestinationGuard.add(destinationKey);
      }

      const metadata = {
        source: file.name,
        framework: analysis.framework,
        tenantId: tenant,
        storeId: store,
        templateKey: targetKey,
        mode,
        status: "DRAFT",
        workflow: "ONE_CLICK_ENTERPRISE_MIGRATION_2026_14",
        routes: analysis.routes,
        pages: analysis.pages,
        missingPages: analysis.missing,
        aiSignals: analysis.ai,
        responsiveAction: analysis.responsive,
        adminManagement: analysis.adminManagement,
        featureCoverage: analysis.coverage,
        pageDiscovery: analysis.pageDiscovery,
        componentDiscovery: analysis.componentDiscovery,
        featureDiscovery: analysis.featureDiscovery,
        quality: analysis.quality,
        smartMapping: completionPlan,
        generatedAt: new Date().toISOString(),
      };
      const metadataContent = encode(JSON.stringify(metadata, null, 2));
      const metadataDestination = `src/templates/imported/${targetKey}/migration-meta.json`;
      const metadataSource = `payload/client/${metadataDestination}`;
      payload.push({ path: metadataSource, content: metadataContent });
      fileDefinitions.push({ owner: "client", sourcePath: metadataSource, destinationPath: metadataDestination, sha256: await sha(metadataContent), sizeBytes: metadataContent.length, contentType: "application/json", operation: "create" });

      setProgress(78);
      setLog((items) => [...items, "Next.js route wrappers generated", "Current platform API adapter generated", "Missing pages mapped to existing platform routes"]);


      const completionArtifacts = generateCompletionArtifacts(targetKey, analysis);
      for (const artifact of completionArtifacts) {
        const sourcePath = normalizeArchivePath(`payload/client/${artifact.path}`);
        payload.push({
          path: sourcePath,
          content: artifact.content,
        });
        fileDefinitions.push({
          owner: "client",
          sourcePath,
          destinationPath: artifact.path,
          sha256: await sha(artifact.content),
          sizeBytes: artifact.content.length,
          contentType: artifact.path.endsWith(".json")
            ? "application/json"
            : "text/typescript",
          operation: "create",
        });
      }
      setLog((items) => [
        ...items,
        `Completion Engine generated ${completionArtifacts.length} artifacts`,
      ]);


      const semanticDesignArtifacts = generateSemanticDesignArtifacts(
        targetKey,
        analysis,
      );

      for (const artifact of semanticDesignArtifacts) {
        const sourcePath = normalizeArchivePath(`payload/client/${artifact.path}`);
        payload.push({
          path: sourcePath,
          content: artifact.content,
        });
        fileDefinitions.push({
          owner: "client",
          sourcePath,
          destinationPath: artifact.path,
          sha256: await sha(artifact.content),
          sizeBytes: artifact.content.length,
          contentType: "application/json",
          operation: "create",
        });
      }

      setLog((items) => [
        ...items,
        `Semantic Design Engine generated ${semanticDesignArtifacts.length} artifacts for all discovered pages`,
      ]);

      const manifest = {
        schemaVersion: "1.0",
        pluginKey: `saqso.migrated-template.${targetKey}`,
        name: `Migrated Template ${targetKey}`,
        description: `AI Migrator generated DRAFT for tenant ${tenant} / store ${store}.`,
        vendor: { key: "saqso.ai-migrator", name: "SAQSO AI Migrator" },
        version: "1.0.0",
        minimumPlatformVersion: "1.0.0",
        maximumPlatformVersion: "999.999.999",
        dependencies: [],
        conflicts: [],
        supportedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
        tenantScope: "TENANT_SCOPED",
        subscriptionRequirements: { requiredPlanKeys: [], requiredEntitlements: [] },
        featureFlags: [],
        files: fileDefinitions,
        databaseChanges: { hasChanges: false, migrationPlanPath: null, rollbackPlanPath: null, destructive: false },
        permissions: analysis.adminManagement.map((capability) => ({
          key: generatedPermissionKey(targetKey, capability),
          name: `Manage ${capability.label}`,
          description: `Tenant/store scoped management permission for migrated ${capability.label}.`,
        })),
        menus: generatedAdminMenus,
        widgets: [],
        settings: [],
        events: [],
        healthChecks: fileDefinitions.slice(0, 3).map((definition, index) => ({
          key: `migrated-file-${index + 1}`,
          type: "FILE_HASH",
          required: true,
          target: `client/${String(definition.destinationPath)}`,
        })),
        installStrategy: { mode: "DECLARATIVE_TRANSACTION", requiresRestart: true, requiresRebuild: true },
        rollbackStrategy: { mode: "DECLARATIVE_TRANSACTION", requiresRestart: true, requiresRebuild: true },
        uninstallStrategy: { preserveData: true, removeOwnedFiles: true, removeRegistrations: true },
      };

      const executionPlan = {
        generatedAt: new Date().toISOString(),
        pluginKey: manifest.pluginKey,
        target: { tenantId: tenant, storeId: store, templateKey: targetKey, mode },
        status: "AWAITING_APPROVAL",
        strategy: "DECLARATIVE_TRANSACTION",
        safeguards: [
          "Validate ownership before every file operation",
          "Create immutable backup metadata before update/replace operations",
          "Stop execution on the first required health-check failure",
          "Rollback all applied operations when the transaction fails",
          "Keep generated template unpublished until sandbox validation passes",
        ],
        operations: fileDefinitions.map((definition, index) => ({
          sequence: index + 1,
          owner: definition.owner,
          destinationPath: definition.destinationPath,
          operation: definition.operation,
          sha256: definition.sha256,
          required: true,
          status: "PLANNED",
        })),
        postInstallValidation: [
          "Client/Admin/Server TypeScript validation",
          "Next.js route and import integrity",
          "Current API runtime binding",
          "Tenant/store isolation",
          "Responsive viewport matrix 320-1920px",
          "Before/after visual-fidelity review",
        ],
      };

      const rollbackPlan = {
        generatedAt: executionPlan.generatedAt,
        pluginKey: manifest.pluginKey,
        strategy: "DECLARATIVE_TRANSACTION",
        preserveData: true,
        steps: fileDefinitions
          .map((definition, index) => ({
            sequence: fileDefinitions.length - index,
            owner: definition.owner,
            destinationPath: definition.destinationPath,
            rollbackAction: definition.operation === "create" ? "REMOVE_CREATED_FILE" : "RESTORE_BACKUP",
          }))
          .reverse(),
      };

      const archiveFiles: GeneratedFile[] = [
        { path: "plugin.manifest.json", content: encode(JSON.stringify(manifest, null, 2)) },
        { path: "execution-plan.json", content: encode(JSON.stringify(executionPlan, null, 2)) },
        { path: "rollback-plan.json", content: encode(JSON.stringify(rollbackPlan, null, 2)) },
        { path: "CHANGELOG.md", content: encode(`# 1.0.0\n- Generated migrated template ${targetKey}.\n`) },
        { path: "UPGRADE.md", content: encode("Fresh generated template plugin. Install only after sandbox build and visual review.\n") },
        ...payload,
      ];
      const uniqueFiles = uniqueArchiveFiles(archiveFiles);
      archiveFiles.length = 0;
      archiveFiles.push(...uniqueFiles);
      const checksumLines: string[] = [];
      for (const archiveFile of archiveFiles) {
        if (archivePathKey(archiveFile.path) === "checksums.sha256") continue;
        checksumLines.push(`${await sha(archiveFile.content)}  ${normalizeArchivePath(archiveFile.path)}`);
      }
      archiveFiles.splice(1, 0, {
        path: "checksums.sha256",
        content: encode(`${checksumLines.join("\n")}\n`),
      });
      const normalizedArchive = uniqueArchiveFiles(archiveFiles);
      archiveFiles.length = 0;
      archiveFiles.push(...normalizedArchive);

      const draftFiles: DraftCodeFile[] = fileDefinitions.map((definition) => {
        const path = String(definition.destinationPath);
        const owner = String(definition.owner) as DraftCodeFile["owner"];
        const category: DraftCodeFile["category"] =
          path.includes("migrated-management") ? "ADMIN"
          : path.includes("modules/migrated") ? "API"
          : path.endsWith("migration-meta.json") ? "METADATA"
          : path.includes("/components/") ? "COMPONENT"
          : path.includes("/app/") ? "PAGE"
          : "ASSET";
        return {
          owner,
          path,
          operation: String(definition.operation) as DraftCodeFile["operation"],
          category,
          sizeBytes: Number(definition.sizeBytes),
          status: "GENERATED",
        };
      });
      for (const capability of analysis.adminManagement) {
        if (capability.status === "REUSE" && capability.existingRoute) {
          draftFiles.push({
            owner: "admin",
            path: capability.existingRoute,
            operation: "replace",
            category: "ADMIN",
            sizeBytes: 0,
            status: "REUSED",
          });
        }
      }
      setGeneratedFiles(draftFiles);
      setCodeApproved(false);
      setExecutionApproved(false);
      setPluginBlob(zipStore(archiveFiles));

      const report = {
        ...metadata,
        output: {
          files: payload.length,
          pluginKey: manifest.pluginKey,
          completionArtifacts: completionArtifacts.length,
          generatedPages: completionArtifacts.filter((item) => item.category === "PAGE").length,
          generatedComponents: completionArtifacts.filter((item) => item.category === "COMPONENT").length,
          generatedAdapters: completionArtifacts.filter((item) => item.category === "ADAPTER").length,
          semanticDesignArtifacts: semanticDesignArtifacts.length,
          pageDesignContracts: semanticDesignArtifacts.filter(
            (item) => item.category === "PAGE_CONTRACT",
          ).length,
          semanticAdminGapPlans: semanticDesignArtifacts.filter(
            (item) => item.category === "ADMIN_GAP",
          ).length,
        },
        execution: executionPlan,
        rollback: rollbackPlan,
        gates: {
          realApi: options.realData ? "ADAPTER_GENERATED_RUNTIME_VALIDATION_REQUIRED" : "NOT_REQUESTED",
          visualFidelity: "BEFORE_AFTER_REVIEW_REQUIRED",
          responsive: analysis.responsive,
          build: "SANDBOX_BUILD_REQUIRED",
          ai: analysis.ai.length ? "IMPORTED_AI_SIGNALS_PRESERVED_IMPLEMENTATION_REVIEW_REQUIRED" : "NO_IMPORTED_AI_SIGNAL",
          adminManagement: analysis.adminManagement.every((item) => item.status === "REUSE") ? "EXISTING_MANAGEMENT_REUSED" : "MISSING_MANAGEMENT_FORMS_AND_SERVER_CONTRACTS_GENERATED",
          featureDependencyCoverage: analysis.coverage,
          enterpriseValidation: validationCertification,
        },
      };
      setReportBlob(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));

      if (analysis.hasDb || analysis.coverage.some((item) => item.database === "MANUAL")) {
        const powerShell = `# SAQSO AI Migrator database preflight package\n# This package does not modify the database automatically.\n$ErrorActionPreference = 'Stop'\nWrite-Host 'Database/schema artifacts were detected in ${file.name}.' -ForegroundColor Yellow\nWrite-Host 'Review migration-report.json and create an approved Prisma/PowerShell migration before deployment.'\n`;
        setPsBlob(zipStore([
          { path: "RUN_DB_PREFLIGHT.ps1", content: encode(powerShell) },
          { path: "migration-report.json", content: encode(JSON.stringify(report, null, 2)) },
        ]));
      } else {
        setPsBlob(null);
      }

      setProgress(100);
      setState("DONE");
      setLog((items) => [...items, "Installable source-code plugin ZIP generated", "Migration status: DRAFT"]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setState("FAILED");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>SAQSO AI MIGRATOR · FINAL SCHEMA CONSUMER RECOVERY</p>
          <h1>Tenant-Aware AI Migration</h1>
          <p>Create or select a real tenant and store, detect imported AI capabilities, reuse existing platform AI, and plan implementation for genuinely new AI features.</p>
        </div>
        <span className={styles.badge}>2026.26.2 LTS</span>
      </header>

      <section className={styles.card}>
        <h2>1. Upload source ZIP</h2>
        <label className={styles.drop}>
          <input type="file" accept=".zip" onChange={(event) => event.target.files?.[0] && choose(event.target.files[0])} />
          <strong>{file?.name || "Choose React, Next.js, Laravel, Blade or static ZIP"}</strong>
          <span>Archive and analysis are restored after browser refresh in this tab.</span>
        </label>
        {restoring && <p className={styles.notice}>Restoring previous migration workspace…</p>}
        {file && <button type="button" className={styles.secondary} onClick={async () => { await clearPersistedMigration(); setFile(null); setBuffer(null); setAnalysis(null); setSourceMap(new Map()); setState("IDLE"); setProgress(0); setLog([]); setPluginBlob(null); setReportBlob(null); setPsBlob(null); setGeneratedFiles([]); setCodeApproved(false); setExecutionApproved(false); }}>Clear uploaded project</button>}
        {error && <p className={styles.error}>{error}</p>}
      </section>

      {analysis && (
        <>
          <section className={styles.metrics}>
            <div><span>Framework</span><strong>{analysis.framework}</strong></div>
            <div><span>Files</span><strong>{analysis.entries.length}</strong></div>
            <div><span>Routes</span><strong>{analysis.routes.length}</strong></div>
            <div><span>Responsive</span><strong>{analysis.responsive}</strong></div>
            <div><span>Completeness</span><strong>{analysis.quality.completeness}%</strong></div>
            <div><span>Difficulty</span><strong>{analysis.quality.difficulty}</strong></div>
          </section>



          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <div>
                <h2>Project discovery summary</h2>
                <p className={styles.notice}>{analysis.quality.projectType} · {analysis.quality.classification} · Migration difficulty {analysis.quality.difficulty}</p>
              </div>
              <strong>{analysis.quality.completeness}% complete</strong>
            </div>
            <div className={styles.discoveryScores}>
              <span><em>Page completeness</em><b>{analysis.quality.completeness}%</b></span>
              <span><em>Design completeness</em><b>{analysis.quality.designCompleteness}%</b></span>
              <span><em>Real data signals</em><b>{analysis.quality.dataBinding}%</b></span>
              <span><em>Interaction quality</em><b>{analysis.quality.interaction}%</b></span>
              <span><em>Responsive quality</em><b>{analysis.quality.responsive}%</b></span>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <div>
                <h2>Visual fidelity & responsive certification</h2>
                <p className={styles.notice}>Source CSS/theme evidence is preserved first. Broken responsive behavior is repaired surgically; working behavior is kept.</p>
              </div>
              <span className={styles.fidelityBadge} data-status={visualFidelity!.status}>{visualFidelity!.score}% · {visualFidelity!.status}</span>
            </div>
            <div className={styles.fidelityMetrics}>
              <span><em>Stylesheets</em><b>{visualFidelity!.cssFiles}</b></span>
              <span><em>Style systems</em><b>{visualFidelity!.styleSystems.join(", ") || "Inline/unknown"}</b></span>
              <span><em>Colors</em><b>{visualFidelity!.colors}</b></span>
              <span><em>Fonts</em><b>{visualFidelity!.fontFamilies}</b></span>
              <span><em>Media queries</em><b>{visualFidelity!.mediaQueries}</b></span>
              <span><em>Animations</em><b>{visualFidelity!.animations}</b></span>
              <span><em>Responsive action</em><b>{visualFidelity!.responsiveDecision}</b></span>
            </div>
            <div className={styles.fidelityChecks}>
              {visualFidelity!.checks.map((check) => (
                <article key={check.label} data-status={check.status}>
                  <div><strong>{check.label}</strong><b>{check.status}</b></div>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            {visualFidelity!.globalLeakRisks.length > 0 && (
              <div className={styles.fidelityRisk}>
                <strong>CSS reconciliation required</strong>
                {visualFidelity!.globalLeakRisks.map((risk) => <p key={risk}>{risk}</p>)}
              </div>
            )}
            <p className={styles.notice}>Before/after certification target: no missing visible section, no horizontal overflow, no critical overlap, and ≥95% approved design fidelity before publish.</p>
          </section>

          {validationCertification && (
            <section className={styles.card}>
              <div className={styles.cardTitle}>
                <div>
                  <h2>Enterprise validation certification</h2>
                  <p className={styles.notice}>Pre-install certification is evidence-based. Runtime build, API and before/after review remain mandatory where marked REVIEW.</p>
                </div>
                <span className={styles.validationBadge} data-status={validationCertification.status}>
                  {validationCertification.score}% · {validationCertification.status}
                </span>
              </div>
              <div className={styles.validationSummary}>
                <span><em>Passed gates</em><b>{validationCertification.gates.filter((gate) => gate.status === "PASS").length}</b></span>
                <span><em>Review gates</em><b>{validationCertification.gates.filter((gate) => gate.status === "REVIEW").length}</b></span>
                <span><em>Blocked gates</em><b>{validationCertification.gates.filter((gate) => gate.status === "BLOCKED").length}</b></span>
                <span><em>Publish ready</em><b>{validationCertification.publishReady ? "YES" : "NO"}</b></span>
              </div>
              <div className={styles.validationGrid}>
                {validationCertification.gates.map((gate) => (
                  <article key={gate.key} data-status={gate.status}>
                    <div><strong>{gate.label}</strong><b>{gate.status}</b></div>
                    <p>{gate.detail}</p>
                  </article>
                ))}
              </div>
              {validationCertification.requiredActions.length > 0 && (
                <div className={styles.validationActions}>
                  <strong>Required actions before certification</strong>
                  {validationCertification.requiredActions.map((action) => <p key={action}>{action}</p>)}
                </div>
              )}
              <button type="button" className={styles.secondary} onClick={downloadCompletionPlan}>
                Download validation & completion plan
              </button>
            </section>
          )}

          <section className={styles.card}>
            <h2>Required pages and incomplete design</h2>
            <div className={styles.discoveryGrid}>
              {analysis.pageDiscovery.map((item) => (
                <article key={item.key} className={styles.discoveryItem} data-status={item.status}>
                  <div><strong>{item.label}</strong><b>{item.score}%</b></div>
                  <span>{item.status}</span>
                  {item.gaps.length > 0 && <small>{item.gaps.join(" · ")}</small>}
                </article>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2>Required component detection</h2>
            <div className={styles.componentMatrix}>
              {analysis.componentDiscovery.map((item) => (
                <span key={item.key} data-status={item.status}><em>{item.label}</em><b>{item.status}</b></span>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2>Feature and data-connection detection</h2>
            <div className={styles.componentMatrix}>
              {analysis.featureDiscovery.map((item) => (
                <span key={item.key} data-status={item.status}><em>{item.label}</em><b>{item.status}</b></span>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2>Feature dependency coverage</h2>
            <div className={styles.coverageGrid}>
              {analysis.coverage.length === 0 && <p className={styles.notice}>No managed feature dependency chain was detected.</p>}
              {analysis.coverage.map((item) => (
                <article key={item.key} className={styles.coverageItem}>
                  <div className={styles.coverageTitle}><strong>{item.label}</strong><b>{item.overall}%</b></div>
                  <div className={styles.coverageLayers}>
                    {(["client", "admin", "api", "permission", "database", "ai"] as const).map((layer) => (
                      <span key={layer} data-status={item[layer]}><em>{layer}</em>{item[layer]}</span>
                    ))}
                  </div>
                  {item.notes.map((note) => <small key={note}>{note}</small>)}
                </article>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2>Admin management coverage</h2>
            <div className={styles.managementGrid}>
              {analysis.adminManagement.length === 0 && <p className={styles.notice}>No managed business feature was detected in this source.</p>}
              {analysis.adminManagement.map((item) => (
                <article key={item.key} className={styles.managementItem}>
                  <strong>{item.label}</strong>
                  <span>{item.status === "REUSE" ? `Connect existing ${item.existingRoute}` : "Generate required list/form fields"}</span>
                  <small>{item.fields.join(", ")}</small>
                </article>
              ))}
            </div>
          </section>

          {completionPlan && (
            <>
              <section className={styles.card}>
                <div className={styles.cardTitle}>
                  <div>
                    <h2>Smart mapping decisions</h2>
                    <p className={styles.notice}>Every discovered page, component, feature and Admin capability receives an explicit action and confidence score.</p>
                  </div>
                  <button type="button" onClick={downloadCompletionPlan} className={styles.secondary}>Download plan</button>
                </div>
                <div className={styles.mappingGrid}>
                  {completionPlan.decisions.map((item) => (
                    <article key={item.id} className={styles.mappingItem} data-action={item.action}>
                      <div className={styles.mappingTitle}>
                        <span>{item.area}</span>
                        <b>{item.action}</b>
                      </div>
                      <strong>{item.label}</strong>
                      <p>{item.reason}</p>
                      <small>{item.output}</small>
                      <div className={styles.confidence}>
                        <span style={{ width: `${item.confidence}%` }} />
                        <em>{item.confidence}% confidence</em>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.card}>
                <h2>Migration simulation</h2>
                <div className={styles.simulationGrid}>
                  <span><em>Reuse</em><b>{completionPlan.simulation.reuse}</b></span>
                  <span><em>Connect</em><b>{completionPlan.simulation.connect}</b></span>
                  <span><em>Merge/repair</em><b>{completionPlan.simulation.merge}</b></span>
                  <span><em>Generate</em><b>{completionPlan.simulation.generate}</b></span>
                  <span><em>Admin modules</em><b>{completionPlan.simulation.adminModules}</b></span>
                  <span><em>API adapters</em><b>{completionPlan.simulation.apiAdapters}</b></span>
                  <span><em>AI implementations</em><b>{completionPlan.simulation.aiFeatures}</b></span>
                  <span><em>Responsive repairs</em><b>{completionPlan.simulation.responsiveRepairs}</b></span>
                  <span><em>PowerShell required</em><b>{completionPlan.simulation.powerShellRequired ? "YES" : "NO"}</b></span>
                  <span><em>Risk</em><b>{completionPlan.simulation.risk}</b></span>
                </div>
              </section>

              <section className={styles.plannerColumns}>
                <article className={styles.card}>
                  <h2>Completion plan</h2>
                  <ol className={styles.executionSteps}>
                    {completionPlan.steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                </article>
                <article className={styles.card}>
                  <h2>Blockers and warnings</h2>
                  {completionPlan.blockers.length === 0 && <p className={styles.success}>No hard blocker detected.</p>}
                  {completionPlan.blockers.map((item) => <p key={item} className={styles.error}>{item}</p>)}
                  {completionPlan.warnings.length === 0 && <p className={styles.notice}>No additional warning detected.</p>}
                  {completionPlan.warnings.map((item) => <p key={item} className={styles.notice}>{item}</p>)}
                </article>
              </section>
            </>
          )}

          <section className={styles.card}>
            <h2>2. Migration options</h2>
            <div className={styles.options}>
              {Object.entries({
                convert: "Convert JS/JSX to TS/TSX",
                reuseApi: "Generate current API adapter",
                realData: "Require current real data",
                missing: "Complete missing pages using platform routes",
                theme: "Preserve source CSS/theme/page design",
                ai: "Preserve/import AI capability signals",
                responsive: "Preserve or repair responsive behavior",
              }).map(([key, label]) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={options[key as keyof typeof options]}
                    onChange={(event) => setOptions((current) => ({ ...current, [key]: event.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <h2>3. Target assignment</h2>
              <button type="button" onClick={refreshTargetCatalog} className={styles.secondary} disabled={loadingTargets}>{loadingTargets ? "Refreshing…" : "Refresh APIs"}</button>
            </div>
            {loadingTargets && <p>Loading tenant data…</p>}
            {targetError && <p className={styles.notice}>{targetError}</p>}
            <div className={styles.formGrid}>
              <label>
                <span>Tenant</span>
                <select value={tenant} onChange={(event) => { setTenant(event.target.value); setStore(""); }}>
                  <option value="">Select tenant</option>
                  {tenants.map((item) => <option key={item.id} value={item.id}>{item.name}{item.slug ? ` (${item.slug})` : ""}</option>)}
                </select>
              </label>
              <label>
                <span>Store</span>
                <select value={store} onChange={(event) => setStore(event.target.value)} disabled={!tenant}>
                  <option value="">Select store</option>
                  {filteredStores.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>
                <span>Mode</span>
                <select value={mode} onChange={(event) => setMode(event.target.value)}>
                  <option value="TEMPLATE_VARIANT">Create template variant</option>
                  <option value="NEW_TEMPLATE">Create new template</option>
                  <option value="UPDATE_EXISTING">Update existing template draft</option>
                </select>
              </label>
              {mode === "UPDATE_EXISTING" ? (
                <label>
                  <span>Existing template</span>
                  <select value={template} onChange={(event) => setTemplate(event.target.value)}>
                    <option value="">Select template</option>
                    {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
              ) : (
                <label>
                  <span>New template key</span>
                  <input value={newKey} onChange={(event) => setNewKey(event.target.value)} placeholder="fashion-import-v1" />
                </label>
              )}
            </div>
          </section>

          <section className={styles.oneClickPanel}>
            <div>
              <span className={styles.oneClickEyebrow}>ONE-CLICK WORKFLOW</span>
              <h2>Ready for guided enterprise migration</h2>
              <p>One action runs discovery → mapping → code generation → transaction packaging. Human approval, sandbox build, real API verification and publication gates remain enforced.</p>
            </div>
            <div className={styles.oneClickSteps}>
              <span data-ready={Boolean(file)}>1. Source ZIP</span>
              <span data-ready={Boolean(analysis)}>2. Discovery</span>
              <span data-ready={Boolean(tenant && store)}>3. Tenant & Store</span>
              <span data-ready={Boolean(targetKey)}>4. Template Target</span>
              <span data-ready={ready}>5. Generate Package</span>
            </div>
          </section>

          <section className={styles.card}>
            <h2>4. One-click migration</h2>
            <button className={styles.primary} disabled={!ready || state === "RUNNING"} onClick={execute}>
              {state === "RUNNING" ? "Running one-click migration…" : "Run One-Click Migration"}
            </button>
            <div className={styles.progress}><span style={{ width: `${progress}%` }} /></div>
            <div className={styles.logs}>{log.map((item, index) => <p key={`${item}-${index}`}>✓ {item}</p>)}</div>
            {state === "DONE" && (
              <>
                <section className={styles.generatedWorkspace}>
                  <div className={styles.cardTitle}>
                    <div>
                      <h3>Generated code workspace</h3>
                      <p className={styles.notice}>Review every generated, reused or merged artifact before approving the installable Plugin ZIP.</p>
                    </div>
                    <b>{generatedFiles.length} files</b>
                  </div>
                  <div className={styles.generatedSummary}>
                    <span><em>Client</em><b>{generatedFiles.filter((item) => item.owner === "client").length}</b></span>
                    <span><em>Admin</em><b>{generatedFiles.filter((item) => item.owner === "admin").length}</b></span>
                    <span><em>Server</em><b>{generatedFiles.filter((item) => item.owner === "server").length}</b></span>
                    <span><em>Generated</em><b>{generatedFiles.filter((item) => item.status === "GENERATED").length}</b></span>
                    <span><em>Reused</em><b>{generatedFiles.filter((item) => item.status === "REUSED").length}</b></span>
                  </div>
                  <div className={styles.generatedFiles}>
                    {generatedFiles.map((item, index) => (
                      <article key={`${item.owner}-${item.path}-${index}`} data-status={item.status}>
                        <div>
                          <span>{item.owner.toUpperCase()} · {item.category}</span>
                          <b>{item.status}</b>
                        </div>
                        <code>{item.path}</code>
                        <small>{item.operation.toUpperCase()} · {item.sizeBytes.toLocaleString()} bytes</small>
                      </article>
                    ))}
                  </div>
                  <label className={styles.approvalGate}>
                    <input type="checkbox" checked={codeApproved} onChange={(event) => setCodeApproved(event.target.checked)} />
                    <span>আমি generated file list review করেছি এবং DRAFT code artifact approve করছি।</span>
                  </label>
                  <section className={styles.executionWorkspace}>
                    <div className={styles.cardTitle}>
                      <div>
                        <h3>Production migration execution plan</h3>
                        <p className={styles.notice}>The generated plugin will execute as one declarative transaction with ownership validation, backups, health checks and rollback metadata.</p>
                      </div>
                      <b>{generatedFiles.filter((item) => item.status !== "REUSED").length} planned operations</b>
                    </div>
                    <div className={styles.executionGrid}>
                      <span><em>Transaction</em><b>ATOMIC</b></span>
                      <span><em>Ownership</em><b>REQUIRED</b></span>
                      <span><em>Backup</em><b>BEFORE WRITE</b></span>
                      <span><em>Rollback</em><b>AUTOMATIC</b></span>
                      <span><em>Publication</em><b>DRAFT ONLY</b></span>
                      <span><em>DB changes</em><b>{psBlob ? "POWERSHELL ONLY" : "NONE"}</b></span>
                    </div>
                    <label className={styles.approvalGate}>
                      <input type="checkbox" checked={executionApproved} onChange={(event) => setExecutionApproved(event.target.checked)} />
                      <span>আমি transaction safeguards, rollback plan এবং post-install validation requirements review করেছি।</span>
                    </label>
                  </section>
                </section>
                <div className={styles.downloads}>
                  <button disabled={!codeApproved || !executionApproved} onClick={() => pluginBlob && save(pluginBlob, `PLUGIN_MIGRATED_TEMPLATE_${targetKey}.zip`)}>Download Execution-Ready Plugin ZIP</button>
                  <button onClick={() => reportBlob && save(reportBlob, "migration-report.json")}>Download Report</button>
                  {psBlob && <button onClick={() => save(psBlob, "DATABASE_POWERSHELL_PREFLIGHT.zip")}>Download PowerShell Package</button>}
                </div>
                {(!codeApproved || !executionApproved) && <p className={styles.notice}>Approval gates pending: review generated files and the production execution transaction before downloading the plugin.</p>}
              </>
            )}
            <p className={styles.notice}>Generated output is DRAFT. Sandbox build, current API runtime verification and before/after visual review remain mandatory before publication.</p>
          </section>
        </>
      )}
    {analysis && <AiCapabilityDiscoveryPanel imported={analysis.ai} />}
</main>
  );
}
