type Product = {
  id: string;
  name?: string;
  category: string;
  brand?: string;
  price?: number;
  tags?: string[];
  score?: number;
};

type UserHistory = {
  category: string;
  brand?: string;
  price?: number;
  tags?: string[];
};

type CustomerSignal = {
  preferences?: {
    key: string;
    value: string;
    weight?: number;
  }[];
  styleProfile?: {
    topCategory?: string | null;
    topBrand?: string | null;
    preferredStyle?: string | null;
    topSize?: string | null;
    topColor?: string | null;
  } | null;
  savedLooks?: any[];
  tryOns?: any[];
  wishlist?: any[];
  recommendationHistory?: any[];
};

const normalize = (value?: string | null) =>
  value?.toLowerCase().trim() || "";

const getAveragePrice = (history: UserHistory[]) => {
  const prices = history
    .map((item) => Number(item.price || 0))
    .filter((price) => price > 0);

  if (!prices.length) return 0;

  return Math.round(
    prices.reduce((sum, price) => sum + price, 0) / prices.length
  );
};

const hasSharedTags = (
  productTags: string[] = [],
  historyTags: string[] = []
) => {
  const normalizedHistory = historyTags.map(normalize);

  return productTags.some((tag) =>
    normalizedHistory.includes(normalize(tag))
  );
};

const addScore = (
  current: number,
  condition: boolean,
  value: number
) => {
  return condition ? current + value : current;
};

export const recommendationEngine = {
  recommend(
    userHistory: UserHistory[],
    products: Product[]
  ): Product[] {
    const preferredCategories = userHistory.map(
      (item) => item.category
    );

    return products
      .filter((product) =>
        preferredCategories.includes(product.category)
      )
      .slice(0, 8);
  },

  smartRecommend(
    userHistory: UserHistory[],
    products: Product[]
  ): Product[] {
    const categoryCount: Record<string, number> = {};
    const brandCount: Record<string, number> = {};
    const historyTags: string[] = [];

    for (const item of userHistory) {
      const category = normalize(item.category);
      const brand = normalize(item.brand);

      if (category) categoryCount[category] = (categoryCount[category] || 0) + 1;
      if (brand) brandCount[brand] = (brandCount[brand] || 0) + 1;
      if (item.tags?.length) historyTags.push(...item.tags);
    }

    const averagePrice = getAveragePrice(userHistory);

    return products
      .map((product) => {
        const category = normalize(product.category);
        const brand = normalize(product.brand);

        let score = categoryCount[category] || 0;

        if (brandCount[brand]) score += brandCount[brand] * 2;

        if (averagePrice > 0 && product.price) {
          const diff = Math.abs(product.price - averagePrice);

          if (diff <= averagePrice * 0.25) score += 3;
          else if (diff <= averagePrice * 0.5) score += 1;
        }

        if (hasSharedTags(product.tags || [], historyTags)) score += 3;
        if (category.includes("panjabi")) score += 2;
        if (category.includes("accessories")) score += 1;

        return {
          ...product,
          score,
        };
      })
      .filter((product) => (product.score ?? 0) > 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 10);
  },

  customerIntelligenceRecommend(
    signal: CustomerSignal,
    products: Product[]
  ): Product[] {
    const preferenceMap = new Map<string, number>();

    signal.preferences?.forEach((item) => {
      const value = normalize(item.value);
      if (!value) return;

      preferenceMap.set(
        value,
        (preferenceMap.get(value) || 0) + Number(item.weight || 1)
      );
    });

    const topCategory = normalize(signal.styleProfile?.topCategory);
    const topBrand = normalize(signal.styleProfile?.topBrand);
    const preferredStyle = normalize(signal.styleProfile?.preferredStyle);

    const historyProductIds = new Set<string>();

    signal.recommendationHistory?.forEach((item) => {
      if (item.productId) historyProductIds.add(item.productId);
    });

    return products
      .map((product) => {
        const category = normalize(product.category);
        const brand = normalize(product.brand);
        const name = normalize(product.name);
        const tags = product.tags?.map(normalize) || [];

        let score = 0;

        score = addScore(score, Boolean(topCategory && category.includes(topCategory)), 10);
        score = addScore(score, Boolean(topBrand && brand.includes(topBrand)), 8);
        score = addScore(score, Boolean(preferredStyle && tags.includes(preferredStyle)), 7);
        score = addScore(score, Boolean(preferredStyle && name.includes(preferredStyle)), 4);

        preferenceMap.forEach((weight, value) => {
          const matched =
            category.includes(value) ||
            brand.includes(value) ||
            name.includes(value) ||
            tags.includes(value);

          if (matched) score += weight * 2;
        });

        signal.savedLooks?.forEach((item) => {
          const title = normalize(item.lookbook?.title);
          if (title && (name.includes(title) || tags.includes(title))) {
            score += 4;
          }
        });

        signal.tryOns?.forEach((item) => {
          const triedCategory = normalize(item.product?.category?.name);
          const triedBrand = normalize(item.product?.brand?.name);

          if (triedCategory && category.includes(triedCategory)) score += 3;
          if (triedBrand && brand.includes(triedBrand)) score += 2;
        });

        signal.wishlist?.forEach((item) => {
          const wishCategory = normalize(item.product?.category?.name);
          const wishBrand = normalize(item.product?.brand?.name);

          if (wishCategory && category.includes(wishCategory)) score += 3;
          if (wishBrand && brand.includes(wishBrand)) score += 2;
        });

        if (historyProductIds.has(product.id)) {
          score -= 5;
        }

        return {
          ...product,
          score,
        };
      })
      .filter((product) => (product.score ?? 0) > 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 12);
  },

  relatedProducts(
    product: Product,
    products: Product[]
  ): Product[] {
    const currentCategory = normalize(product.category);
    const currentBrand = normalize(product.brand);

    return products
      .filter((item) => item.id !== product.id)
      .map((item) => {
        let score = 0;

        if (normalize(item.category) === currentCategory) score += 5;
        if (currentBrand && normalize(item.brand) === currentBrand) score += 3;

        if (
          product.price &&
          item.price &&
          Math.abs(item.price - product.price) <= product.price * 0.3
        ) {
          score += 2;
        }

        if (hasSharedTags(item.tags || [], product.tags || [])) score += 3;

        return {
          ...item,
          score,
        };
      })
      .filter((item) => (item.score ?? 0) > 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 8);
  },

  crossSell(
    product: Product,
    products: Product[]
  ): Product[] {
    const productCategory = normalize(product.category);

    return products
      .filter((item) => item.id !== product.id)
      .map((item) => {
        let score = 0;
        const category = normalize(item.category);

        if (
          productCategory.includes("panjabi") &&
          (category.includes("accessories") ||
            category.includes("shoe") ||
            category.includes("watch"))
        ) {
          score += 5;
        }

        if (
          productCategory.includes("shirt") &&
          (category.includes("pant") ||
            category.includes("belt") ||
            category.includes("watch"))
        ) {
          score += 5;
        }

        if (hasSharedTags(item.tags || [], product.tags || [])) score += 2;

        return {
          ...item,
          score,
        };
      })
      .filter((item) => (item.score ?? 0) > 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 6);
  },

  upsell(
    product: Product,
    products: Product[]
  ): Product[] {
    const basePrice = Number(product.price || 0);

    if (basePrice <= 0) return [];

    return products
      .filter((item) => item.id !== product.id)
      .map((item) => {
        let score = 0;

        if (normalize(item.category) === normalize(product.category)) score += 3;

        if (
          item.price &&
          item.price > basePrice &&
          item.price <= basePrice * 1.6
        ) {
          score += 4;
        }

        if (normalize(item.brand) === normalize(product.brand)) score += 2;

        return {
          ...item,
          score,
        };
      })
      .filter((item) => (item.score ?? 0) > 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 6);
  },
};

export const recommendProducts = (
  userHistory: UserHistory[],
  products: Product[]
): Product[] => {
  return recommendationEngine.smartRecommend(userHistory, products);
};

export const recommendationAI = (
  userHistory: UserHistory[],
  products: Product[]
): Product[] => {
  return recommendationEngine.smartRecommend(userHistory, products);
};

export const customerIntelligenceRecommendationAI = (
  signal: CustomerSignal,
  products: Product[]
): Product[] => {
  return recommendationEngine.customerIntelligenceRecommend(signal, products);
};

export const relatedProductsAI = (
  product: Product,
  products: Product[]
): Product[] => {
  return recommendationEngine.relatedProducts(product, products);
};

export const crossSellAI = (
  product: Product,
  products: Product[]
): Product[] => {
  return recommendationEngine.crossSell(product, products);
};

export const upsellAI = (
  product: Product,
  products: Product[]
): Product[] => {
  return recommendationEngine.upsell(product, products);
};
