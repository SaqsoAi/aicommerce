type Product = {
  name: string;
  category: string;
};

type AiSearchProduct = {
  id?: string;
  name?: string;
  title?: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  sku?: string | null;
  tags?: string[];
  price?: number | null;
};

type AiSearchScoredProduct = AiSearchProduct & {
  score: number;
};

export const searchEngine = {
  /**
   * Basic keyword search (fallback engine)
   */
  search: (query: string, products: Product[]) => {
    const q = query.toLowerCase();

    if (!q || !products?.length) {
      return [];
    }

    return products.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    });
  },

  /**
   * Lightweight scoring version (optional upgrade)
   */
  quickSearch: (query: string, products: Product[]) => {
    const q = query.toLowerCase();

    return products
      .map((p) => {
        let score = 0;

        if (p.name?.toLowerCase().includes(q)) score += 2;
        if (p.category?.toLowerCase().includes(q)) score += 1;

        return { ...p, score };
      })
      .filter((p: AiSearchScoredProduct) => p.score > 0)
      .sort((a: AiSearchScoredProduct, b: AiSearchScoredProduct) => b.score - a.score);
  },
};