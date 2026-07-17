export type PersonalizationSignalInput = {
  customerId?: string | null;
  tenantId?: string | null;
  searchScore?: number;
  product?: Record<string, any>;
  customer?: Record<string, any>;
  cart?: Record<string, any>;
  wishlist?: any[];
  recentlyViewed?: any[];
  orders?: any[];
  membership?: Record<string, any>;
  rewards?: Record<string, any>;
  context?: Record<string, any>;
};

export type RankedProduct<T = any> = T & {
  personalizationScore?: number;
  finalRankingScore?: number;
  rankingReasons?: string[];
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const textOf = (value: unknown): string => {
  if (!value) return "";
  if (Array.isArray(value)) return value.map(textOf).join(" ").toLowerCase();
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).map(textOf).join(" ").toLowerCase();
  return String(value).toLowerCase();
};

const hasAny = (haystack: string, needles: string[]): boolean => needles.some((needle) => needle && haystack.includes(String(needle).toLowerCase()));

export function deriveCustomerPreferences(input: PersonalizationSignalInput) {
  const source = [
    input.customer,
    input.wishlist,
    input.recentlyViewed,
    input.orders,
    input.membership,
    input.rewards,
    input.context,
  ];
  const text = textOf(source);
  const categoryHints = ["men", "women", "kids", "sports", "shirt", "pant", "polo", "t-shirt", "shoe", "watch", "wallet", "belt"];
  const styleHints = ["premium", "basic", "formal", "casual", "luxury", "budget", "new", "sale"];
  const preference = {
    categories: categoryHints.filter((x) => text.includes(x)),
    styles: styleHints.filter((x) => text.includes(x)),
    membershipTier: String(input.membership?.tier || input.membership?.name || "").toLowerCase(),
    rewardIntent: Number(input.rewards?.balance || input.rewards?.points || 0) > 0,
    budget: Number(input.context?.budget || input.customer?.budget || 0) || undefined,
  };
  return preference;
}

export function calculatePersonalizationScore(input: PersonalizationSignalInput): { score: number; reasons: string[] } {
  const productText = textOf(input.product);
  const prefs = deriveCustomerPreferences(input);
  const reasons: string[] = [];
  let score = 0;

  if (prefs.categories.length && hasAny(productText, prefs.categories)) {
    score += 0.22;
    reasons.push("category preference");
  }
  if (prefs.styles.length && hasAny(productText, prefs.styles)) {
    score += 0.16;
    reasons.push("style preference");
  }
  if (prefs.membershipTier && productText.includes(prefs.membershipTier)) {
    score += 0.12;
    reasons.push("membership relevance");
  }
  if (prefs.rewardIntent && /reward|point|coupon|offer|discount/i.test(productText)) {
    score += 0.10;
    reasons.push("reward relevance");
  }

  const stock = Number((input.product as any)?.stock ?? (input.product as any)?.quantity ?? (input.product as any)?.inventory ?? 1);
  if (stock > 0) {
    score += 0.12;
    reasons.push("in stock");
  }

  const popularity = Number((input.product as any)?.popularityScore ?? (input.product as any)?.views ?? (input.product as any)?.salesCount ?? 0);
  if (popularity > 0) {
    score += clamp(popularity / 1000) * 0.10;
    reasons.push("popular");
  }

  const searchScore = Number(input.searchScore ?? (input.product as any)?.semanticScore ?? 0);
  if (searchScore > 0) {
    score += clamp(searchScore) * 0.18;
    reasons.push("semantic match");
  }

  return { score: clamp(score), reasons };
}

export function rankPersonalizedProducts<T extends Record<string, any>>(products: T[], input: PersonalizationSignalInput): RankedProduct<T>[] {
  return [...products]
    .map((product) => {
      const result = calculatePersonalizationScore({ ...input, product, searchScore: Number(product.semanticScore ?? product.searchScore ?? 0) });
      const businessScore = Number(product.businessScore ?? product.priority ?? 0);
      const finalRankingScore = clamp(result.score + clamp(businessScore / 100) * 0.10);
      return { ...product, personalizationScore: result.score, finalRankingScore, rankingReasons: result.reasons };
    })
    .sort((a, b) => Number(b.finalRankingScore || 0) - Number(a.finalRankingScore || 0));
}

export function personalizeHomepage(input: PersonalizationSignalInput) {
  const prefs = deriveCustomerPreferences(input);
  const primaryCategory = prefs.categories[0] || "featured";
  const tier = prefs.membershipTier || "standard";
  return {
    segment: "dynamic-customer-preference",
    hero: {
      priority: tier !== "standard" ? 95 : 80,
      headline: tier !== "standard" ? `Exclusive ${tier} picks for you` : `Recommended ${primaryCategory} styles for you`,
      subheadline: "Personalized from browsing, wishlist, membership, reward, and order signals.",
      ctaLabel: tier !== "standard" ? "View member picks" : "Shop recommended",
      imageStrategy: primaryCategory,
    },
    banners: [
      { key: primaryCategory, priority: 90, reason: "category preference" },
      { key: "membership", priority: tier !== "standard" ? 85 : 55, reason: "membership tier" },
      { key: "rewards", priority: prefs.rewardIntent ? 80 : 45, reason: "reward balance" },
    ],
  };
}

export function recommendWishlistAlternatives(input: PersonalizationSignalInput) {
  const prefs = deriveCustomerPreferences(input);
  return {
    alternatives: prefs.categories.map((category) => ({ type: "alternative", category })),
    matching: prefs.styles.map((style) => ({ type: "matching", style })),
    premiumUpgrades: [{ type: "premium-upgrade", hint: "premium collection" }],
    budgetAlternatives: [{ type: "budget-alternative", hint: "best value" }],
  };
}

export function recommendCrossSell(input: PersonalizationSignalInput) {
  const text = textOf([input.product, input.cart, input.context]);
  const map: Record<string, string[]> = {
    shirt: ["pant", "belt", "watch", "wallet", "shoe"],
    polo: ["pant", "belt", "watch", "shoe"],
    "t-shirt": ["jeans", "sneaker", "cap"],
    shoe: ["socks", "belt", "wallet"],
  };
  const key = Object.keys(map).find((x) => text.includes(x)) || "shirt";
  return map[key].map((category, index) => ({ category, score: 1 - index * 0.08, reason: `cross-sell for ${key}` }));
}

export function recommendUpsell(input: PersonalizationSignalInput) {
  const text = textOf([input.product, input.cart, input.context]);
  const hints = text.includes("basic")
    ? ["premium t-shirt", "premium polo", "premium collection"]
    : ["premium collection", "new arrival", "member exclusive"];
  return hints.map((hint, index) => ({ hint, score: 1 - index * 0.10, reason: "upsell upgrade path" }));
}

export const aiPersonalizationService = {
  deriveCustomerPreferences,
  calculatePersonalizationScore,
  rankPersonalizedProducts,
  personalizeHomepage,
  recommendWishlistAlternatives,
  recommendCrossSell,
  recommendUpsell,
};

export default aiPersonalizationService;
